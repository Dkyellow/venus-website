var VenusBooking = {
    API_BASE: 'https://booking.venushealthcare.co.zw/api',
    selectedService: null,
    selectedPractitioner: null,
    selectedDate: null,
    selectedTime: null,
    calYear: null,
    calMonth: null,
    availableDates: [],
    currentPeriod: 'AM',
    allSlots: [],

    init: function () {
        var today = new Date();
        this.calYear = today.getFullYear();
        this.calMonth = today.getMonth();
        var self = this;
        document.addEventListener('click', function (e) {
            var dd = document.getElementById('calendar-dropdown');
            var ci = document.getElementById('calendar-input');
            if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && ci && !ci.contains(e.target)) {
                dd.style.display = 'none';
            }
        });
        this.loadServices();
    },

    apiFetch: function (path) {
        return fetch(this.API_BASE + path).then(function (res) {
            if (!res.ok) throw new Error('API error');
            return res.json();
        });
    },

    loadServices: function () {
        var self = this;
        this.apiFetch('/services').then(function (data) {
            var sel = document.getElementById('service-select');
            if (!sel) return;
            var services = data.services || [];
            services.forEach(function (s) {
                var opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                sel.appendChild(opt);
            });
        }).catch(function () {});
    },

    onServiceChange: function (id) {
        this.selectedService = id ? parseInt(id) : null;
        this.selectedPractitioner = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableDates = [];
        this.allSlots = [];
        this.updatePractitioners();
        this.resetDate();
        this.hideTimeCard();
        this.hideForm();
        this.updateSummary();
    },

    onPractitionerChange: function (id) {
        this.selectedPractitioner = id ? parseInt(id) : null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableDates = [];
        this.allSlots = [];
        this.resetDate();
        this.hideTimeCard();
        this.updateSummary();
        if (this.selectedService) this.loadAvailableDates();
    },

    updatePractitioners: function () {
        var self = this;
        var sel = document.getElementById('practitioner-select');
        if (!sel || !this.selectedService) {
            if (sel) sel.innerHTML = '<option value="">Any available practitioner</option>';
            return;
        }
        sel.innerHTML = '<option value="">Any available practitioner</option>';
        this.apiFetch('/services/' + this.selectedService + '/practitioners').then(function (data) {
            var practitioners = data.practitioners || [];
            practitioners.forEach(function (p) {
                var opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name + (p.specialization ? ' - ' + p.specialization : '');
                sel.appendChild(opt);
            });
            if (self.selectedService) self.loadAvailableDates();
        }).catch(function () {});
    },

    loadAvailableDates: function () {
        var self = this;
        if (!this.selectedService) return;
        var url = '/booking/available-dates?service_id=' + this.selectedService;
        if (this.selectedPractitioner) url += '&practitioner_id=' + this.selectedPractitioner;
        var grid = document.getElementById('cal-grid');
        if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#9ca3af;font-size:0.8125rem;">Loading dates...</div>';
        this.apiFetch(url).then(function (data) {
            self.availableDates = data.dates || [];
            self.renderCalendar();
        }).catch(function () { console.error(arguments); });
    },

    toggleCalendar: function () {
        var dd = document.getElementById('calendar-dropdown');
        if (!dd) return;
        if (dd.style.display === 'none' || !dd.style.display) {
            if (this.selectedService && this.availableDates.length === 0) {
                this.loadAvailableDates();
            }
            dd.style.display = 'block';
        } else {
            dd.style.display = 'none';
        }
    },

    prevMonth: function () {
        this.calMonth--;
        if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; }
        this.renderCalendar();
    },

    nextMonth: function () {
        this.calMonth++;
        if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
        this.renderCalendar();
    },

    renderCalendar: function () {
        var grid = document.getElementById('cal-grid');
        var label = document.getElementById('cal-month-year');
        if (!grid || !label) return;
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        label.textContent = months[this.calMonth] + ' ' + this.calYear;

        var firstDay = new Date(this.calYear, this.calMonth, 1);
        var daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
        var startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1;

        var availSet = {};
        this.availableDates.forEach(function (d) {
            var dateStr = typeof d === 'string' ? d : d.date;
            availSet[dateStr] = true;
        });
        var today = new Date().toISOString().split('T')[0];

        var html = '';
        for (var i = 0; i < startDow; i++) html += '<div class="bp-cal-day empty"></div>';
        for (var day = 1; day <= daysInMonth; day++) {
            var dateStr = this.calYear + '-' + String(this.calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            var isAvailable = availSet[dateStr] && dateStr >= today;
            var isSelected = this.selectedDate === dateStr;
            var isPast = dateStr < today;
            var cls = 'bp-cal-day';
            if (isAvailable && !isPast) cls += ' available';
            else cls += ' unavailable';
            if (isSelected) cls += ' selected';
            if (isPast) cls += ' past';

            if (isAvailable && !isPast) {
                html += '<div class="' + cls + '" onclick="VenusBooking.pickDate(\'' + dateStr + '\')">' + day + '</div>';
            } else {
                html += '<div class="' + cls + '">' + day + '</div>';
            }
        }
        grid.innerHTML = html;
    },

    pickDate: function (dateStr) {
        this.selectedDate = dateStr;
        this.selectedTime = null;
        var dt = new Date(dateStr + 'T00:00:00');
        var display = dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        document.getElementById('calendar-display').textContent = display;
        document.getElementById('calendar-dropdown').style.display = 'none';
        this.loadTimeSlots();
        this.updateSummary();
    },

    clearDate: function () {
        this.selectedDate = null;
        this.selectedTime = null;
        document.getElementById('calendar-display').textContent = 'Pick a date';
        document.getElementById('calendar-dropdown').style.display = 'none';
        this.hideTimeCard();
        this.hideForm();
        this.updateSummary();
    },

    resetDate: function () {
        this.selectedDate = null;
        this.selectedTime = null;
        var calDisp = document.getElementById('calendar-display');
        if (calDisp) calDisp.textContent = 'Pick a date';
        var dd = document.getElementById('calendar-dropdown');
        if (dd) dd.style.display = 'none';
    },

    loadTimeSlots: function () {
        var self = this;
        if (!this.selectedService || !this.selectedDate) return;
        var timeCard = document.getElementById('time-card');
        var timeList = document.getElementById('time-list');
        if (!timeCard || !timeList) return;
        timeCard.style.display = 'block';
        timeList.innerHTML = '<div class="bp-time-loading"><div class="bp-spinner"></div></div>';

        var url = '/booking/slots?service_id=' + this.selectedService + '&date=' + this.selectedDate;
        if (this.selectedPractitioner) url += '&practitioner_id=' + this.selectedPractitioner;
        this.apiFetch(url).then(function (data) {
            self.allSlots = data.slots || [];
            self.renderTimeList();
        }).catch(function () {
            timeList.innerHTML = '<p class="bp-time-empty">Failed to load times.</p>';
        });
    },

    setPeriod: function (p) {
        this.currentPeriod = p;
        document.querySelectorAll('.bp-amp').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-period') === p);
        });
        this.renderTimeList();
    },

    renderTimeList: function () {
        var list = document.getElementById('time-list');
        if (!list) return;
        var self = this;
        var filtered = this.allSlots.filter(function (s) {
            var h = parseInt(s.start_time.split(':')[0]);
            return self.currentPeriod === 'AM' ? h < 12 : h >= 12;
        });
        if (filtered.length === 0) {
            list.innerHTML = '<p class="bp-time-empty">No times available in this period.</p>';
            return;
        }
        list.innerHTML = filtered.map(function (s) {
            var isSelected = self.selectedTime && self.selectedTime.start === s.start_time;
            return '<button class="bp-time-item' + (isSelected ? ' selected' : '') + '" onclick="VenusBooking.pickTime(\'' + s.start_time + '\',\'' + s.end_time + '\',\'' + s.display + '\')">' + s.display + '</button>';
        }).join('');
    },

    pickTime: function (start, end, display) {
        this.selectedTime = { start: start, end: end, display: display };
        document.querySelectorAll('.bp-time-item').forEach(function (b) {
            b.classList.toggle('selected', b.textContent.trim() === display);
        });
        document.getElementById('patient-form-section').style.display = 'block';
        this.updateSummary();
        document.getElementById('patient-form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    hideTimeCard: function () {
        var tc = document.getElementById('time-card');
        if (tc) tc.style.display = 'none';
    },

    hideForm: function () {
        var fs = document.getElementById('patient-form-section');
        if (fs) fs.style.display = 'none';
    },

    updateSummary: function () {
        var el = document.getElementById('summary-content');
        if (!el) return;
        var serviceSel = document.getElementById('service-select');
        var pracSel = document.getElementById('practitioner-select');
        var html = '';

        if (this.selectedService && serviceSel && serviceSel.selectedIndex > 0) {
            html += '<div class="bp-sum-row"><span class="bp-sum-label">Service</span><span class="bp-sum-value">' + serviceSel.options[serviceSel.selectedIndex].text + '</span></div>';
        }
        if (this.selectedPractitioner && pracSel && pracSel.selectedIndex > 0) {
            html += '<div class="bp-sum-row"><span class="bp-sum-label">Practitioner</span><span class="bp-sum-value">' + pracSel.options[pracSel.selectedIndex].text + '</span></div>';
        } else if (this.selectedService) {
            html += '<div class="bp-sum-row"><span class="bp-sum-label">Practitioner</span><span class="bp-sum-value">Any available</span></div>';
        }
        if (this.selectedDate) {
            var dt = new Date(this.selectedDate + 'T00:00:00');
            html += '<div class="bp-sum-row"><span class="bp-sum-label">Date</span><span class="bp-sum-value">' + dt.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) + '</span></div>';
        }
        if (this.selectedTime) {
            html += '<div class="bp-sum-row"><span class="bp-sum-label">Time</span><span class="bp-sum-value">' + this.selectedTime.display + '</span></div>';
        }

        var btn = document.getElementById('confirm-btn');
        if (btn) btn.disabled = !(this.selectedService && this.selectedDate && this.selectedTime);

        el.innerHTML = html || '<p class="bp-summary-empty">Complete the form to see your booking summary.</p>';
    },

    submitBooking: function () {
        var self = this;
        var form = document.getElementById('booking-form');
        if (!form || !this.selectedService || !this.selectedDate || !this.selectedTime) {
            if (!this.selectedService) this.showMessage('Please select a service first.', 'warning');
            else if (!this.selectedDate) this.showMessage('Please pick a date.', 'warning');
            else if (!this.selectedTime) this.showMessage('Please pick a time slot.', 'warning');
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var fd = new FormData(form);
        var data = {
            service_id: this.selectedService,
            practitioner_id: this.selectedPractitioner,
            date: this.selectedDate,
            start_time: this.selectedTime.start,
            end_time: this.selectedTime.end,
            first_name: fd.get('first_name'),
            last_name: fd.get('last_name'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            reason: fd.get('reason') || ''
        };

        var btn = document.getElementById('confirm-btn');
        var originalHTML = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<div class="bp-spinner" style="width:16px;height:16px;border-width:2px;"></div> Submitting...'; }

        fetch(this.API_BASE + '/booking/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function (res) { return res.json(); })
        .then(function (result) {
            if (result.success) {
                self.showSuccessModal(result);
            } else {
                self.showMessage(result.message || 'Booking failed. Please try again.', 'error');
                if (btn) { btn.disabled = false; btn.innerHTML = originalHTML; }
            }
        })
        .catch(function () {
            self.showMessage('Network error. Please check your connection and try again.', 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = originalHTML; }
        });
    },

    showSuccessModal: function (result) {
        var modal = document.getElementById('bookingSuccessModal');
        if (!modal) {
            this.showMessage('Booking successful! Reference: ' + (result.reference || ''), 'success');
            return;
        }

        var refEl = document.getElementById('modal-ref-number');
        if (refEl) refEl.textContent = result.reference ? '#' + result.reference : '';

        var detailsEl = document.getElementById('modal-booking-details');
        if (detailsEl) {
            var serviceSel = document.getElementById('service-select');
            var pracSel = document.getElementById('practitioner-select');
            var serviceName = (serviceSel && serviceSel.selectedIndex > 0) ? serviceSel.options[serviceSel.selectedIndex].text : '';
            var pracName = (pracSel && pracSel.selectedIndex > 0) ? pracSel.options[pracSel.selectedIndex].text : 'Any Available Practitioner';

            var dateStr = '';
            if (this.selectedDate) {
                var dt = new Date(this.selectedDate + 'T00:00:00');
                dateStr = dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            }
            var timeStr = this.selectedTime ? this.selectedTime.display : '';

            detailsEl.innerHTML =
                '<div class="bp-modal-detail-row"><span>Service:</span><strong>' + serviceName + '</strong></div>' +
                '<div class="bp-modal-detail-row"><span>Doctor:</span><strong>' + pracName + '</strong></div>' +
                '<div class="bp-modal-detail-row"><span>Date:</span><strong>' + dateStr + '</strong></div>' +
                '<div class="bp-modal-detail-row"><span>Time:</span><strong>' + timeStr + '</strong></div>';
        }

        modal.style.display = 'flex';
        setTimeout(function () { modal.classList.add('active'); }, 10);
    },

    closeSuccessModal: function () {
        var modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(function () { modal.style.display = 'none'; }, 300);
        }
    },

    showMessage: function (msg, type) {
        var el = document.getElementById('vb-message');
        if (!el) return;
        el.className = 'vb-message vb-message-' + (type || 'info');
        el.textContent = msg;
        el.style.display = 'block';
        var self = this;
        setTimeout(function () { el.style.display = 'none'; }, 4000);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('service-select')) VenusBooking.init();
});
