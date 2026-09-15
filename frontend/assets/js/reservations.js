document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_CUSTOMER']);
    if (!user) return;
    // Load Navbar
    loadComponent('navbar-placeholder', '../components/navbar.html');
    // Fetch bookings from backend
    fetchReservations();
});

async function fetchReservations() {
    const container = document.getElementById('reservations-container');

    try {
        const response = await AppAuth.apiFetch('/api/bookings');
        if (!response.ok) throw new Error(await AppAuth.responseMessage(response));

        const bookings = await response.json();
        container.innerHTML = ''; // Clear loading spinner

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center mt-4">
                    <h5 class="text-muted">You have no reservations yet.</h5>
                </div>`;
            return;
        }

        // Loop through bookings and create cards
        bookings.forEach(booking => {
            const vehicleName = booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'Unknown Vehicle';
            const branchName = booking.pickupBranch ? booking.pickupBranch.name : 'Unknown Branch';
            const total = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(booking.totalAmount);

            // Set badge color based on status
            let badgeColor = 'bg-warning text-dark'; // PENDING
            if (booking.status === 'CONFIRMED') badgeColor = 'bg-success';
            if (booking.status === 'CANCELLED') badgeColor = 'bg-danger';

            // Format Date
            const pickupDate = new Date(booking.pickupDatetime).toLocaleString();

            const cardHTML = `
                <div class="col-md-6 mb-4">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span class="text-muted small fw-bold">Booking ID: #${booking.id}</span>
                                <span class="badge ${badgeColor}">${booking.status}</span>
                            </div>
                            <h5 class="fw-bold text-dark">${vehicleName}</h5>
                            <p class="text-muted mb-1 small">Pickup: ${pickupDate}</p>
                            <p class="text-muted mb-3 small">Location: ${branchName}</p>
                            <h6 class="fw-bold text-primary mb-0">Total: ${total}</h6>
                        </div>
                        <div class="card-footer bg-white border-0 text-end pb-3">
                            ${booking.status !== 'CANCELLED' ?
                                `<button class="btn btn-outline-danger btn-sm fw-bold" onclick="cancelBooking(${booking.id})">Cancel Booking</button>`
                                : '<span class="text-muted small fst-italic">This booking is cancelled.</span>'
                            }
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error connecting to the server.</div>';
    }
}

// Function to call the DELETE endpoint (Soft Delete)
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }

    try {
        const response = await AppAuth.apiFetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Reservation cancelled successfully!');
            fetchReservations(); // Reload the UI to show the updated status!
        } else {
            alert('Failed to cancel reservation.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server error occurred.');
    }
}
