document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_MAINTENANCE_SUPERVISOR', 'ROLE_RENTAL_OFFICER', 'ROLE_BRANCH_MANAGER', 'ROLE_ADMIN']);
    if (!user) return;
    loadComponent('navbar-placeholder', '../components/navbar.html');
    loadMaintenanceVehicles();
    fetchMaintenanceRecords();

    document.getElementById('logMaintenanceForm').addEventListener('submit', handleLogMaintenance);
});

// READ: Fetch all maintenance records
async function fetchMaintenanceRecords() {
    const tableBody = document.getElementById('maintenance-table');
    try {
        const response = await AppAuth.apiFetch('/api/maintenance');
        if (!response.ok) throw new Error('Failed to load maintenance records');

        const records = await response.json();
        tableBody.innerHTML = '';

        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No maintenance records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            const vehicleInfo = record.vehicle ? `${record.vehicle.make} ${record.vehicle.model} (${record.vehicle.registrationNumber})` : 'N/A';
            const cost = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(record.cost);

            let badgeClass = 'bg-secondary';
            if (record.status === 'SCHEDULED') badgeClass = 'bg-warning text-dark';
            if (record.status === 'IN_PROGRESS') badgeClass = 'bg-primary';
            if (record.status === 'COMPLETED') badgeClass = 'bg-success';

            const row = `
                <tr>
                    <td class="fw-bold">#SRV-${record.id}</td>
                    <td>${vehicleInfo}</td>
                    <td>${record.serviceDate}</td>
                    <td>${record.odometerReading} km</td>
                    <td>${cost}</td>
                    <td><span class="badge ${badgeClass}">${record.status}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMaintenance(${record.id})">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

// CREATE: Log a new maintenance record
async function handleLogMaintenance(event) {
    event.preventDefault();

    const newRecord = {
        vehicle: { id: parseInt(document.getElementById('vehicleId').value) },
        serviceDate: document.getElementById('serviceDate').value,
        status: document.getElementById('serviceStatus').value,
        odometerReading: parseInt(document.getElementById('odometerReading').value),
        cost: parseFloat(document.getElementById('serviceCost').value)
    };

    try {
        const response = await AppAuth.apiFetch('/api/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });

        if (response.ok) {
            alert('Maintenance record saved successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('logMaintenanceModal'));
            modal.hide();
            document.getElementById('logMaintenanceForm').reset();
            fetchMaintenanceRecords();
        } else {
            alert('Failed to save record. Ensure the Vehicle ID exists!');
        }
    } catch (error) {
        console.error('Error logging maintenance:', error);
    }
}

// DELETE: Remove a maintenance record
async function deleteMaintenance(id) {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
        const response = await AppAuth.apiFetch(`/api/maintenance/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Maintenance record deleted successfully.');
            fetchMaintenanceRecords();
        } else {
            alert('Cannot delete this record.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadMaintenanceVehicles() {
    const response = await AppAuth.apiFetch('/api/vehicles');
    if (!response.ok) return;
    const vehicles = await response.json();
    document.getElementById('vehicleId').innerHTML = '<option value="">Select vehicle</option>' + vehicles.map(vehicle => `<option value="${vehicle.id}">${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}</option>`).join('');
}
