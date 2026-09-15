async function loadComponent(elementId, filePath) {
    const target = document.getElementById(elementId);

    if (!target) return;

    try {
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Component not found: ${filePath}`);
        }

        target.innerHTML = await response.text();

        if (filePath.includes('navbar.html')) {
            await updateNavbarAuth();
        }

    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
    }
}


async function updateNavbarAuth() {

    const container = document.getElementById('nav-auth-container');

    if (!container || !window.AppAuth) return;


    const user = await AppAuth.refreshUser();


    // User is not logged in
    if (!user) {

        container.innerHTML = `
            <a class="btn btn-pill btn-outline-navy" href="/pages/login.html">
                Login
            </a>

            <a class="btn btn-pill btn-navy" href="/pages/register.html">
                Register
            </a>
        `;

        return;
    }


    // Staff navigation
    if (user.role !== 'ROLE_CUSTOMER') {
        updateStaffNavigation(user.role);
    }


    const destination =
        user.role === 'ROLE_CUSTOMER'
            ? '/pages/reservations.html'
            : AppAuth.roleHome(user.role);


    const label =
        user.role === 'ROLE_CUSTOMER'
            ? 'My bookings'
            : 'Dashboard';



    container.innerHTML = `

        <span class="small fw-bold me-2">
            Hi, ${escapeComponentHtml(user.firstName)}
        </span>


        <a class="btn btn-pill btn-outline-navy"
           href="${destination}">
            ${label}
        </a>


        <button class="btn btn-pill btn-navy"
                type="button"
                onclick="logoutUser()">
            Logout
        </button>

    `;
}



function updateStaffNavigation(role) {

    const menu = document.querySelector('#sharedNavbar .navbar-nav');


    if (!menu) return;



    const linksByRole = {


        ROLE_BOOKING_MANAGER: [
            ['Bookings', '/pages/booking-manager.html']
        ],


        ROLE_RENTAL_OFFICER: [
            ['Fleet', '/pages/vehicle-management.html'],
            ['Bookings', '/pages/booking-manager.html'],
            ['Contracts', '/pages/contracts.html']
        ],


        ROLE_ADMIN: [
            ['Fleet', '/pages/vehicle-management.html'],
            ['Bookings', '/pages/booking-manager.html'],
            ['Maintenance', '/pages/maintenance.html'],
            ['Finance', '/pages/promotions.html'],
            ['Branches', '/pages/branches.html']
        ],


        ROLE_MAINTENANCE_SUPERVISOR: [
            ['Maintenance', '/pages/maintenance.html']
        ],


        ROLE_FINANCE_OFFICER: [
            ['Finance', '/pages/promotions.html'],
            ['Contracts', '/pages/contracts.html']
        ],


        ROLE_BRANCH_MANAGER: [
            ['Branches', '/pages/branches.html'],
            ['Bookings', '/pages/booking-manager.html']
        ]

    };



    menu.innerHTML = (linksByRole[role] || [])
        .map(([label, href]) => {

            return `
                <li class="nav-item">
                    <a class="nav-link" href="${href}">
                        ${label}
                    </a>
                </li>
            `;

        })
        .join('');

}



function escapeComponentHtml(value) {

    return String(value ?? '')
        .replace(/[&<>'"]/g, character => ({

            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#039;',
            '"': '&quot;'

        }[character]));

}