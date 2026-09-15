document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_RENTAL_OFFICER', 'ROLE_ADMIN']);
    if (!user) return;
    loadComponent('navbar-placeholder', '../components/navbar.html');
    await loadVehicleOptions();
    fetchAdminVehicles();

    // Listen for the form submission
    document.getElementById('addVehicleForm').addEventListener('submit', handleAddVehicle);
});

// READ: Fetch all vehicles and populate the table
async function fetchAdminVehicles() {
    const tableBody = document.getElementById('admin-vehicle-table');
    try {
        const response = await AppAuth.apiFetch('/api/vehicles');
        if (!response.ok) throw new Error('Failed to load vehicles');

        const vehicles = await response.json();
        tableBody.innerHTML = '';

        if (vehicles.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No vehicles found.</td></tr>';
            return;
        }

        vehicles.forEach(v => {
            const row = `
                <tr>
                    <td class="fw-bold">${v.registrationNumber}</td>
                    <td>${v.make} ${v.model}</td>
                    <td>${v.year}</td>
                    <td>LKR ${v.dailyRate}</td>
                    <td><span class="badge ${v.status === 'AVAILABLE' ? 'bg-success' : 'bg-secondary'}">${v.status}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteVehicle(${v.id})">Deactivate</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

// CREATE: Save a new vehicle
async function handleAddVehicle(event) {
    event.preventDefault();

    const newVehicle = {
        registrationNumber: document.getElementById('regNumber').value,
        make: document.getElementById('make').value,
        model: document.getElementById('model').value,
        year: document.getElementById('year').value,
        dailyRate: document.getElementById('dailyRate').value,
        status: "AVAILABLE",
        branch: { id: Number(document.getElementById('branchId').value) },
        category: { id: Number(document.getElementById('categoryId').value) }
    };

    try {
        const response = await AppAuth.apiFetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVehicle)
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            // Close modal & reload table
            const modal = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
            modal.hide();
            document.getElementById('addVehicleForm').reset();
            fetchAdminVehicles();
        } else {
            alert('Failed to add vehicle. Check console for errors.');
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
    }
}

// DELETE: Delete a vehicle
async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to deactivate this vehicle?')) return;

    try {
        const response = await AppAuth.apiFetch(`/api/vehicles/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Vehicle deactivated successfully.');
            fetchAdminVehicles(); // Refresh the table
        } else {
            alert('Cannot delete this vehicle (it might have connected bookings).');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadVehicleOptions() {
    try {
        const [categoriesResponse, branchesResponse] = await Promise.all([
            AppAuth.apiFetch('/api/categories'), AppAuth.apiFetch('/api/branches')
        ]);
        const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
        const branches = branchesResponse.ok ? await branchesResponse.json() : [];
        document.getElementById('categoryId').innerHTML = '<option value="">Select category</option>' + categories.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
        document.getElementById('branchId').innerHTML = '<option value="">Select branch</option>' + branches.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load vehicle options:', error);
    }
}
