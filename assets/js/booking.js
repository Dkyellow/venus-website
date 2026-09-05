var VenusBooking = {
    API_BASE: 'https://booking.venushealthcare.co.zw/api',
    step: 1,
    totalSteps: 4,
    services: [],
    practitioners: [],
    availableDates: [],
    allSlots: [],
    calYear: null,
    calMonth: null,

    selected: {
        serviceId: null,
        serviceName: '',
        practitionerId: null,
        practitionerName: '',
        date: null,
        startTime: null,
        endTime: null,
        timeDisplay: ''
    },

    init: function () {
        var today = new Date();
        this.calYear = today.getFullYear();
        this.calMonth = today.getMonth();
        this.loadServices();
        this.render();
    },

    apiFetch: function (path) {
        var self = this;
        return fetch(this.API_BASE + path)
            .then(function (res) {
                if (!res.ok) throw new Error('API error');
                return res.json();
            });
    },

    loadServices: function () {
        var self = this;
        this.apiFetch('/services').then(function (data) {
            self.services = data.services || [];
            self.renderServiceOptions();
        }).catch(function () {
            self.services = [];
            self.renderServiceOptions();
        });
    },

    loadPractitioners: function (serviceId) {
        var self = this;
        this.practitioners = [];
        if (!serviceId) { self.renderPractitionerOptions(); return; }
        this.apiFetch('/services/' + serviceId + '/practitioners').then(function (data) {
            self.practitioners = data.practitioners || [];
            self.renderPractitionerOptions();
        }).catch(function () {
            self.practitioners = [];
            self.renderPractitionerOptions();
        });
    },

    loadDates: function () {
        var self = this;
        if (!this.selected.serviceId) return;
        var url = '/booking/available-dates?service_id=' + this.selected.serviceId;
        if (this.selected.practitionerId) url += '&practitioner_id=' + this.selected.practitionerId;
        this.availableDates = [];
        this.showCalendarLoading(true);
        this.apiFetch(url).then(function (data) {
            self.availableDates = data.dates || [];
            self.showCalendarLoading(false);
            self.renderCalendar();
        }).catch(function () {
            self.availableDates = [];
            self.showCalendarLoading(false);
            self.renderCalendar();
        });
    },

    loadSlots: function () {
        var self = this;
        if (!this.selected.serviceId || !this.selected.date) return;
        var url = '/booking/slots?service_id=' + this.selected.serviceId + '&date=' + this.selected.date;
        if (this.selected.practitionerId) url += '&practitioner_id=' + this.selected.practitionerId;
        this.allSlots = [];
        this.showSlotsLoading(true);
        this.apiFetch(url).then(function (data) {
            self.allSlots = data.slots || [];
            self.showSlotsLoading(false);
            self.renderSlots();
        }).catch(function () {
            self.allSlots = [];
            self.showSlotsLoading(false);
            self.renderSlots();
        });
    },

    showCalendarLoading: function (show) {
        var el = document.getElementById('vb-cal-loading');
        if (el) el.style.display = show ? 'flex' : 'none';
        var grid = document.getElementById('vb-cal-grid');
        if (grid) grid.style.display = show ? 'none' : 'grid';
    },

    showSlotsLoading: function (show) {
        var el = document.getElementById('vb-slots-loading');
        if (el) el.style.display = show ? 'flex' : 'none';
        var grid = document.getElementById('vb-slots-grid');
        if (grid) grid.style.display = show ? 'none' : 'grid';
    },

    renderServiceOptions: function () {
        var el = document.getElementById('vb-service-list');
        if (!el) return;
        if (this.services.length === 0) {
            el.innerHTML = '<p class="vb-empty">Loading services...</p>';
            return;
        }
        el.innerHTML = this.services.map(function (s) {
            return '<button class="vb-option" data-id="' + s.id + '" data-name="' + (s.name || '').replace(/"/g, '&quot;') + '">' +
                '<i class="bi ' + (s.icon || 'fa-stethoscope') + '"></i> ' +
                '<span>' + (s.name || '') + '</span>' +
                '</button>';
        }).join('');
    },

    renderPractitionerOptions: function () {
        var el = document.getElementById('vb-practitioner-list');
        if (!el) return;
        var html = '<button class="vb-option vb-option-any" data-id="0">' +
            '<i class="bi bi-people"></i> <span>Any available practitioner</span></button>';
        this.practitioners.forEach(function (p) {
            html += '<button class="vb-option" data-id="' + p.id + '" data-name="' + (p.name || '').replace(/"/g, '&quot;') + '">' +
                '<i class="bi bi-person-circle"></i> <span>' + (p.name || '') +
                (p.specialization ? ' <small>(' + p.specialization + ')</small>' : '') + '</span></button>';
        });
        el.innerHTML = html;
    },

    renderCalendar: function () {
        var grid = document.getElementById('vb-cal-grid');
        var label = document.getElementById('vb-cal-month-label');
        if (!grid || !label) return;
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        label.textContent = months[this.calMonth] + ' ' + this.calYear;

        var firstDay = new Date(this.calYear, this.calMonth, 1);
        var daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
        var startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;

        var availSet = {};
        this.availableDates.forEach(function (d) { availSet[d] = true; });
        var today = new Date().toISOString().split('T')[0];

        var html = '';
        for (var i = 0; i < startDow; i++) html += '<div class="vb-cal-day empty"></div>';
        for (var day = 1; day <= daysInMonth; day++) {
            var dateStr = this.calYear + '-' + String(this.calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            var isAvailable = availSet[dateStr] && dateStr >= today;
            var isSelected = this.selected.date === dateStr;
            var cls = 'vb-cal-day';
            if (isSelected) cls += ' selected';
            if (isAvailable) cls += ' available';
            else cls += ' unavailable';
            html += '<div class="' + cls + '" data-date="' + dateStr + '">' + day + '</div>';
        }
        grid.innerHTML = html;
    },

    renderSlots: function () {
        var grid = document.getElementById('vb-slots-grid');
        var empty = document.getElementById('vb-slots-empty');
        if (!grid) return;
        if (this.allSlots.length === 0) {
            grid.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = this.allSlots.map(function (s) {
            return '<button class="vb-slot" data-start="' + s.start_time + '" data-end="' + s.end_time + '">' +
                s.display + '</button>';
        }).join('');
    },

    renderProgressBar: function () {
        var html = '';
        var labels = ['Service', 'Doctor', 'Date & Time', 'Confirm'];
        var self = this;
        labels.forEach(function (label, i) {
            var num = i + 1;
            var cls = 'vb-step';
            if (num < self.step) cls += ' completed';
            else if (num === self.step) cls += ' active';
            var icon = num < self.step ? '<i class="bi bi-check-circle-fill"></i>' : '<span>' + num + '</span>';
            html += '<div class="' + cls + '">' + icon + '<span class="vb-step-label">' + label + '</span></div>';
        });
        return html;
    },

    renderStepContent: function () {
        switch (this.step) {
            case 1: return this.renderStep1();
            case 2: return this.renderStep2();
            case 3: return this.renderStep3();
            case 4: return this.renderStep4();
            default: return '';
        }
    },

    renderStep1: function () {
        return '<div class="vb-step-content">' +
            '<h3 class="vb-step-title">Select a Service</h3>' +
            '<div id="vb-service-list" class="vb-option-grid">' +
            '<p class="vb-empty">Loading services...</p>' +
            '</div></div>';
    },

    renderStep2: function () {
        return '<div class="vb-step-content">' +
            '<h3 class="vb-step-title">Choose a Doctor</h3>' +
            '<div id="vb-practitioner-list" class="vb-option-grid">' +
            '<p class="vb-empty">Loading practitioners...</p>' +
            '</div></div>';
    },

    renderStep3: function () {
        return '<div class="vb-step-content">' +
            '<h3 class="vb-step-title">Pick a Date & Time</h3>' +
            '<div class="vb-datetime-row">' +
            '<div class="vb-calendar-section">' +
            '<div class="vb-cal-header">' +
            '<button class="vb-cal-nav" id="vb-cal-prev"><i class="bi bi-chevron-left"></i></button>' +
            '<span id="vb-cal-month-label"></span>' +
            '<button class="vb-cal-nav" id="vb-cal-next"><i class="bi bi-chevron-right"></i></button>' +
            '</div>' +
            '<div class="vb-cal-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>' +
            '<div id="vb-cal-loading" class="vb-loading"><div class="vb-spinner"></div><span>Loading dates...</span></div>' +
            '<div id="vb-cal-grid" class="vb-cal-grid"></div>' +
            '</div>' +
            '<div class="vb-slots-section" id="vb-slots-section" style="display:none;">' +
            '<h4 class="vb-slots-title">Available Times</h4>' +
            '<div id="vb-slots-loading" class="vb-loading" style="display:none;"><div class="vb-spinner"></div><span>Loading times...</span></div>' +
            '<div id="vb-slots-empty" class="vb-empty" style="display:none;">No time slots available for this date.</div>' +
            '<div id="vb-slots-grid" class="vb-slots-grid"></div>' +
            '</div>' +
            '</div></div>';
    },

    renderStep4: function () {
        var s = this.selected;
        var dateDisplay = s.date ? this.formatDate(s.date) : '';
        return '<div class="vb-step-content">' +
            '<h3 class="vb-step-title">Confirm Your Booking</h3>' +
            '<div class="vb-summary">' +
            '<div class="vb-summary-row"><span>Service</span><strong>' + (s.serviceName || '') + '</strong></div>' +
            '<div class="vb-summary-row"><span>Doctor</span><strong>' + (s.practitionerName || 'Any available') + '</strong></div>' +
            '<div class="vb-summary-row"><span>Date</span><strong>' + dateDisplay + '</strong></div>' +
            '<div class="vb-summary-row"><span>Time</span><strong>' + (s.timeDisplay || '') + '</strong></div>' +
            '</div>' +
            '<form id="vb-patient-form" class="vb-patient-form">' +
            '<div class="vb-form-row">' +
            '<label class="vb-field"><span class="vb-label">First Name <span class="vb-required">*</span></span>' +
            '<input type="text" name="first_name" required placeholder="e.g. Tendai"></label>' +
            '<label class="vb-field"><span class="vb-label">Last Name <span class="vb-required">*</span></span>' +
            '<input type="text" name="last_name" required placeholder="e.g. Mugabe"></label>' +
            '</div>' +
            '<div class="vb-form-row">' +
            '<label class="vb-field"><span class="vb-label">Email <span class="vb-required">*</span></span>' +
            '<input type="email" name="email" required placeholder="you@example.com"></label>' +
            '<label class="vb-field"><span class="vb-label">Phone <span class="vb-required">*</span></span>' +
            '<input type="tel" name="phone" required placeholder="+263 77 123 4567"></label>' +
            '</div>' +
            '<label class="vb-field"><span class="vb-label">Reason for Visit</span>' +
            '<input type="text" name="reason" placeholder="Optional"></label>' +
            '</form></div>';
    },

    formatDate: function (dateStr) {
        var dt = new Date(dateStr + 'T00:00:00');
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return days[dt.getDay()] + ', ' + dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
    },

    render: function () {
        var container = document.getElementById('vb-wizard');
        if (!container) return;
        container.innerHTML =
            '<div class="vb-progress">' + this.renderProgressBar() + '</div>' +
            '<div class="vb-step-body">' + this.renderStepContent() + '</div>' +
            '<div class="vb-nav">' +
            (this.step > 1 ? '<button class="vb-btn vb-btn-back" id="vb-back"><i class="bi bi-arrow-left"></i> Back</button>' : '<div></div>') +
            (this.step < this.totalSteps ?
                '<button class="vb-btn vb-btn-next" id="vb-next">Next <i class="bi bi-arrow-right"></i></button>' :
                '<button class="vb-btn vb-btn-submit" id="vb-submit"><span class="vb-btn-text">Book Appointment</span><span class="vb-btn-spinner" style="display:none;"><div class="vb-spinner-sm"></div></span></button>') +
            '</div>';
        this.bindEvents();
    },

    bindEvents: function () {
        var self = this;

        // Back button
        var back = document.getElementById('vb-back');
        if (back) back.addEventListener('click', function () { self.prevStep(); });

        // Next button
        var next = document.getElementById('vb-next');
        if (next) next.addEventListener('click', function () { self.nextStep(); });

        // Submit button
        var submit = document.getElementById('vb-submit');
        if (submit) submit.addEventListener('click', function () { self.submitBooking(); });

        // Step 1: Service selection
        if (this.step === 1) {
            var svcList = document.getElementById('vb-service-list');
            if (svcList) {
                svcList.addEventListener('click', function (e) {
                    var btn = e.target.closest('.vb-option');
                    if (!btn) return;
                    var id = parseInt(btn.getAttribute('data-id'));
                    var name = btn.getAttribute('data-name') || btn.textContent.trim();
                    self.selected.serviceId = id;
                    self.selected.serviceName = name;
                    svcList.querySelectorAll('.vb-option').forEach(function (b) { b.classList.remove('selected'); });
                    btn.classList.add('selected');
                    self.loadPractitioners(id);
                });
                // Re-render service list if services already loaded
                if (this.services.length > 0) this.renderServiceOptions();
            }
        }

        // Step 2: Practitioner selection
        if (this.step === 2) {
            var pracList = document.getElementById('vb-practitioner-list');
            if (pracList) {
                pracList.addEventListener('click', function (e) {
                    var btn = e.target.closest('.vb-option');
                    if (!btn) return;
                    var id = parseInt(btn.getAttribute('data-id'));
                    var name = btn.getAttribute('data-name') || 'Any available practitioner';
                    self.selected.practitionerId = id === 0 ? null : id;
                    self.selected.practitionerName = id === 0 ? '' : name;
                    pracList.querySelectorAll('.vb-option').forEach(function (b) { b.classList.remove('selected'); });
                    btn.classList.add('selected');
                });
                if (this.practitioners.length > 0) this.renderPractitionerOptions();
            }
        }

        // Step 3: Calendar and time slots
        if (this.step === 3) {
            var calPrev = document.getElementById('vb-cal-prev');
            var calNext = document.getElementById('vb-cal-next');
            if (calPrev) calPrev.addEventListener('click', function () {
                self.calMonth--;
                if (self.calMonth < 0) { self.calMonth = 11; self.calYear--; }
                self.renderCalendar();
            });
            if (calNext) calNext.addEventListener('click', function () {
                self.calMonth++;
                if (self.calMonth > 11) { self.calMonth = 0; self.calYear++; }
                self.renderCalendar();
            });

            var calGrid = document.getElementById('vb-cal-grid');
            if (calGrid) {
                calGrid.addEventListener('click', function (e) {
                    var day = e.target.closest('.vb-cal-day');
                    if (!day || !day.classList.contains('available')) return;
                    var dateStr = day.getAttribute('data-date');
                    self.selected.date = dateStr;
                    calGrid.querySelectorAll('.vb-cal-day').forEach(function (d) { d.classList.remove('selected'); });
                    day.classList.add('selected');
                    document.getElementById('vb-slots-section').style.display = 'block';
                    self.selected.startTime = null;
                    self.selected.endTime = null;
                    self.selected.timeDisplay = '';
                    self.loadSlots();
                });
            }

            var slotsGrid = document.getElementById('vb-slots-grid');
            if (slotsGrid) {
                slotsGrid.addEventListener('click', function (e) {
                    var slot = e.target.closest('.vb-slot');
                    if (!slot) return;
                    self.selected.startTime = slot.getAttribute('data-start');
                    self.selected.endTime = slot.getAttribute('data-end');
                    self.selected.timeDisplay = slot.textContent.trim();
                    slotsGrid.querySelectorAll('.vb-slot').forEach(function (s) { s.classList.remove('selected'); });
                    slot.classList.add('selected');
                });
            }

            this.loadDates();
        }

        // Step 4: form validity
        if (this.step === 4) {
            var form = document.getElementById('vb-patient-form');
            if (form) {
                form.addEventListener('input', function () {
                    var submit = document.getElementById('vb-submit');
                    if (submit) submit.disabled = !form.checkValidity();
                });
            }
        }
    },

    nextStep: function () {
        if (this.step === 1 && !this.selected.serviceId) {
            this.showMessage('Please select a service.', 'warning');
            return;
        }
        if (this.step === 2 && this.selected.practitionerId === undefined) {
            this.showMessage('Please choose a practitioner or select "Any available".', 'warning');
            return;
        }
        if (this.step < this.totalSteps) {
            this.step++;
            this.render();
        }
    },

    prevStep: function () {
        if (this.step > 1) {
            this.step--;
            this.render();
        }
    },

    showMessage: function (msg, type) {
        var el = document.getElementById('vb-message');
        if (!el) return;
        el.className = 'vb-message vb-message-' + (type || 'info');
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(function () { el.style.display = 'none'; }, 4000);
    },

    submitBooking: function () {
        var self = this;
        var form = document.getElementById('vb-patient-form');
        if (!form) return;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!this.selected.startTime || !this.selected.date) {
            this.showMessage('Please select a date and time slot.', 'warning');
            return;
        }

        var fd = new FormData(form);
        var data = {
            service_id: this.selected.serviceId,
            practitioner_id: this.selected.practitionerId,
            date: this.selected.date,
            start_time: this.selected.startTime,
            end_time: this.selected.endTime,
            first_name: fd.get('first_name'),
            last_name: fd.get('last_name'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            reason: fd.get('reason') || ''
        };

        var btn = document.getElementById('vb-submit');
        var btnText = btn ? btn.querySelector('.vb-btn-text') : null;
        var btnSpin = btn ? btn.querySelector('.vb-btn-spinner') : null;
        if (btn) btn.disabled = true;
        if (btnText) btnText.textContent = 'Booking...';
        if (btnSpin) btnSpin.style.display = 'inline-flex';

        fetch(this.API_BASE + '/booking/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success) {
                self.showConfirmation(result);
            } else {
                self.showMessage(result.message || 'Booking failed. Please try again.', 'error');
                if (btn) btn.disabled = false;
                if (btnText) btnText.textContent = 'Book Appointment';
                if (btnSpin) btnSpin.style.display = 'none';
            }
        })
        .catch(function () {
            self.showMessage('Network error. Please check your connection and try again.', 'error');
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = 'Book Appointment';
            if (btnSpin) btnSpin.style.display = 'none';
        });
    },

    showConfirmation: function (result) {
        var container = document.getElementById('vb-wizard');
        if (!container) return;
        var s = this.selected;
        var dateDisplay = s.date ? this.formatDate(s.date) : '';
        container.innerHTML =
            '<div class="vb-confirmation">' +
            '<div class="vb-confirm-icon"><i class="bi bi-check-circle-fill"></i></div>' +
            '<h3 class="vb-confirm-title">Booking Request Sent!</h3>' +
            '<p class="vb-confirm-ref">Reference: <strong>' + (result.reference || '') + '</strong></p>' +
            '<p class="vb-confirm-msg">' + (result.message || 'Your appointment request has been received. We will confirm your booking shortly via email or phone.') + '</p>' +
            '<div class="vb-summary vb-confirm-summary">' +
            '<div class="vb-summary-row"><span>Service</span><strong>' + (s.serviceName || '') + '</strong></div>' +
            '<div class="vb-summary-row"><span>Doctor</span><strong>' + (s.practitionerName || 'Any available') + '</strong></div>' +
            '<div class="vb-summary-row"><span>Date</span><strong>' + dateDisplay + '</strong></div>' +
            '<div class="vb-summary-row"><span>Time</span><strong>' + (s.timeDisplay || '') + '</strong></div>' +
            '</div>' +
            '<button class="vb-btn vb-btn-next" id="vb-new-booking" style="margin-top:24px;">Book Another Appointment</button>' +
            '</div>';
        var self = this;
        var newBtn = document.getElementById('vb-new-booking');
        if (newBtn) newBtn.addEventListener('click', function () {
            self.selected = { serviceId: null, serviceName: '', practitionerId: null, practitionerName: '', date: null, startTime: null, endTime: null, timeDisplay: '' };
            self.step = 1;
            self.render();
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('vb-wizard')) {
        VenusBooking.init();
    }
});
