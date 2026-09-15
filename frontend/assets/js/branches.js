document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_BRANCH_MANAGER', 'ROLE_ADMIN']);
    if (!user) return;
    loadComponent('navbar-placeholder', '../components/navbar.html');
    fetchBranches();
    document.getElementById('addBranchForm').addEventListener('submit', handleAddBranch);
});

async function fetchBranches() {
    const tableBody = document.getElementById('branch-table');
    try {
        const response = await AppAuth.apiFetch('/api/branches');
        if (!response.ok) throw new Error('Failed to load branches');

        const branches = await response.json();
        tableBody.innerHTML = '';

        if (branches.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No branches found.</td></tr>';
            return;
        }

        branches.forEach(branch => {
            const row = `
                <tr>
                    <td class="fw-bold text-muted">#BR-${branch.id}</td>
                    <td class="fw-bold">${branch.name}</td>
                    <td>${branch.address || 'N/A'}</td>
                    <td>${branch.vehicleCapacity || 0} Vehicles</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteBranch(${branch.id})">Close Branch</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

async function handleAddBranch(event) {
    event.preventDefault();

    const newBranch = {
        name: document.getElementById('branchName').value,
        address: document.getElementById('branchAddress').value,
        contactNumber: document.getElementById('branchContact').value,
        operatingHours: document.getElementById('branchHours').value,
        vehicleCapacity: parseInt(document.getElementById('branchCapacity').value),
        isActive: true
    };

    try {
        const response = await AppAuth.apiFetch('/api/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBranch)
        });

        if (response.ok) {
            alert('Branch added successfully!');
            bootstrap.Modal.getInstance(document.getElementById('addBranchModal')).hide();
            document.getElementById('addBranchForm').reset();
            fetchBranches();
        } else {
            alert('Failed to save branch.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteBranch(id) {
    if (!confirm('Are you sure you want to close this branch?')) return;
    try {
        const response = await AppAuth.apiFetch(`/api/branches/${id}`, { method: 'DELETE' });
        if (response.ok) fetchBranches();
    } catch (error) {
        console.error('Error:', error);
    }
}
