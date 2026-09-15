document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_BOOKING_MANAGER', 'ROLE_RENTAL_OFFICER', 'ROLE_ADMIN', 'ROLE_BRANCH_MANAGER']);
    if (!user) return;
    await loadComponent('navbar-placeholder', '../components/navbar.html');
    document.getElementById('staffNameDisplay').textContent = `Welcome, ${user.firstName}`;
    fetchBookings();
});

async function fetchBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-secondary">Loading bookings...</td></tr>';
    try {
        const response = await AppAuth.apiFetch('/api/bookings');
        if (!response.ok) throw new Error(await AppAuth.responseMessage(response));
        const bookings = await response.json();
        if (!bookings.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-secondary">No bookings have been submitted yet.</td></tr>';
            return;
        }
        tbody.innerHTML = bookings.map(booking => `<tr>
            <td class="px-4 fw-bold">#BK-${booking.id}</td>
            <td>${safeManager(`${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`)}</td>
            <td>${safeManager(`${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`)}</td>
            <td>${formatManagerDate(booking.pickupDatetime)}</td>
            <td>${formatManagerDate(booking.returnDatetime)}</td>
            <td><span class="badge ${statusClass(booking.status)}">${safeManager(booking.status)}</span></td>
            <td class="text-end px-4">
                ${booking.status === 'PENDING' ? `<button class="btn btn-sm btn-success me-1" onclick="updateBookingStatus(${booking.id}, 'CONFIRMED')" title="Approve">Approve</button>` : ''}
                ${!['CANCELLED', 'COMPLETED'].includes(booking.status) ? `<button class="btn btn-sm btn-outline-danger" onclick="cancelManagedBooking(${booking.id})" title="Cancel">Cancel</button>` : ''}
            </td>
        </tr>`).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">${safeManager(error.message)}</td></tr>`;
    }
}

async function updateBookingStatus(id, status) {
    const response = await AppAuth.apiFetch(`/api/bookings/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
    if (!response.ok) return alert(await AppAuth.responseMessage(response));
    fetchBookings();
}

async function cancelManagedBooking(id) {
    if (!confirm('Cancel this booking?')) return;
    const response = await AppAuth.apiFetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (!response.ok) return alert(await AppAuth.responseMessage(response));
    fetchBookings();
}

function statusClass(status) {
    if (status === 'CONFIRMED') return 'bg-success';
    if (status === 'CANCELLED') return 'bg-danger';
    if (status === 'COMPLETED') return 'bg-primary';
    return 'bg-warning text-dark';
}
function formatManagerDate(value) { return value ? new Date(value).toLocaleString() : '-'; }
function safeManager(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character])); }
