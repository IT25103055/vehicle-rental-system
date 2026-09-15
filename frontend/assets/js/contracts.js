document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_RENTAL_OFFICER', 'ROLE_FINANCE_OFFICER', 'ROLE_ADMIN']);
    if (!user) return;
    loadComponent('navbar-placeholder', '../components/navbar.html');
    fetchContracts();

    document.getElementById('generateContractForm').addEventListener('submit', handleGenerateContract);
});

// READ: Fetch all contracts
async function fetchContracts() {
    const tableBody = document.getElementById('contracts-table');
    try {
        const response = await AppAuth.apiFetch('/api/contracts');
        if (!response.ok) throw new Error('Failed to load contracts');

        const contracts = await response.json();
        tableBody.innerHTML = '';

        if (contracts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No contracts found.</td></tr>';
            return;
        }

        contracts.forEach(contract => {
            const bookingId = contract.booking ? contract.booking.id : 'N/A';
            const badgeClass = contract.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary';

            const row = `
                <tr>
                    <td class="fw-bold">#CTR-${contract.id}</td>
                    <td>#BKG-${bookingId}</td>
                    <td>${contract.driverName}</td>
                    <td>${contract.licenseNumber}</td>
                    <td><span class="badge ${badgeClass}">${contract.status || 'DRAFT'}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="voidContract(${contract.id})">Void</button>
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

// CREATE: Generate a new contract
async function handleGenerateContract(event) {
    event.preventDefault();

    const newContract = {
        booking: { id: parseInt(document.getElementById('bookingId').value) },
        driverName: document.getElementById('driverName').value,
        licenseNumber: document.getElementById('licenseNumber').value,
        identityDocument: document.getElementById('identityDocument').value,
        contactDetails: document.getElementById('contactDetails').value,
        status: "ACTIVE"
    };

    try {
        const response = await AppAuth.apiFetch('/api/contracts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContract)
        });

        if (response.ok) {
            alert('Contract generated successfully!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('generateContractModal'));
            modal.hide();
            document.getElementById('generateContractForm').reset();
            fetchContracts();
        } else {
            alert('Failed to generate contract. Ensure the Booking ID exists!');
        }
    } catch (error) {
        console.error('Error generating contract:', error);
    }
}

// DELETE: Void a contract
async function voidContract(id) {
    if (!confirm('Are you sure you want to void this contract?')) return;

    try {
        const response = await AppAuth.apiFetch(`/api/contracts/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Contract voided successfully.');
            fetchContracts();
        } else {
            alert('Cannot void this contract.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
