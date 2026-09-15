document.addEventListener('DOMContentLoaded', async () => {
    const user = await AppAuth.requireRole(['ROLE_FINANCE_OFFICER', 'ROLE_ADMIN']);
    if (!user) return;
    loadComponent('navbar-placeholder', '../components/navbar.html');
    fetchPromotions();
    document.getElementById('addPromoForm').addEventListener('submit', handleAddPromotion);
});

async function fetchPromotions() {
    const tableBody = document.getElementById('promo-table');
    try {
        const response = await AppAuth.apiFetch('/api/promotions');
        if (!response.ok) throw new Error('Failed to load promotions');

        const promos = await response.json();
        tableBody.innerHTML = '';

        if (promos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No promotions active.</td></tr>';
            return;
        }

        promos.forEach(promo => {
            const row = `
                <tr>
                    <td class="fw-bold text-success">${promo.code}</td>
                    <td>${promo.discountPercentage}%</td>
                    <td>${promo.endDate || 'No Expiry'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePromotion(${promo.id})">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load data.</td></tr>';
    }
}

async function handleAddPromotion(event) {
    event.preventDefault();

    const newPromo = {
        code: document.getElementById('promoCode').value.toUpperCase(),
        discountPercentage: parseFloat(document.getElementById('discountPercentage').value),
        endDate: document.getElementById('endDate').value
    };

    try {
        const response = await AppAuth.apiFetch('/api/promotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPromo)
        });

        if (response.ok) {
            alert('Promo code created successfully!');
            bootstrap.Modal.getInstance(document.getElementById('addPromoModal')).hide();
            document.getElementById('addPromoForm').reset();
            fetchPromotions();
        } else {
            alert('Failed to save promo code.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deletePromotion(id) {
    if (!confirm('Delete this promo code?')) return;
    try {
        const response = await AppAuth.apiFetch(`/api/promotions/${id}`, { method: 'DELETE' });
        if (response.ok) fetchPromotions();
    } catch (error) {
        console.error('Error:', error);
    }
}
