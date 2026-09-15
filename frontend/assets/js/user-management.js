document.addEventListener("DOMContentLoaded", () => {

    loadUsers();


    const addButton = document.querySelector(".btn-accent");

    if(addButton){

        addButton.addEventListener("click", () => {

            addStaffUser();

        });

    }

});





async function loadUsers() {


    const table = document.getElementById("usersTable");


    if(!table) return;



    try {


        const response = await AppAuth.apiFetch("/api/users");


        if(!response.ok){

            throw new Error("Failed loading users");

        }



        const users = await response.json();



        table.innerHTML = "";



        if(users.length === 0){

            table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No users found
                </td>
            </tr>
            `;

            return;

        }





        users.forEach(user => {



            const roleName =
                user.role === "ROLE_CUSTOMER"
                ? "Normal User"
                : "Staff";



            table.innerHTML += `

            <tr>

                <td>
                    ${user.firstName} ${user.lastName}
                </td>


                <td>
                    ${user.email}
                </td>


                <td>
                    ${roleName}
                </td>


                <td>

                ${
                    user.isActive === true
                    ?
                    '<span class="badge bg-success">Active</span>'
                    :
                    '<span class="badge bg-danger">Inactive</span>'
                }

                </td>



                <td>

                    <button
                    class="btn btn-sm btn-danger"
                    onclick="deleteUser(${user.id})">

                    Delete

                    </button>


                </td>


            </tr>

            `;



        });



    }catch(error){

        console.error(error);


        table.innerHTML = `

        <tr>

        <td colspan="5" class="text-center text-danger">

        Failed to load users

        </td>

        </tr>

        `;


    }


}







async function deleteUser(id){


    if(!confirm("Delete this user?")) return;



    try{


        const response = await AppAuth.apiFetch(
            `/api/users/${id}`,
            {
                method:"DELETE"
            }
        );



        if(response.ok){


            alert("User deleted successfully");


            // reload table without refresh

            await loadUsers();


        }
        else{


            alert("Delete failed");


        }



    }catch(error){

        console.error(error);

    }


}








async function addStaffUser(){


    const firstName = prompt("Enter first name:");

    if(!firstName) return;



    const lastName = prompt("Enter last name:");

    if(!lastName) return;



    const email = prompt("Enter email:");

    if(!email) return;



    const password = prompt("Enter password:");

    if(!password) return;



    const role = prompt(
        "Enter role:\nROLE_ADMIN\nROLE_BOOKING_MANAGER\nROLE_RENTAL_OFFICER"
    );


    if(!role) return;




    const user = {


        firstName:firstName,

        lastName:lastName,

        email:email,

        password:password,

        phone:"",

        drivingLicenceNumber:""

    };





    try{


        const response = await AppAuth.apiFetch(
            `/api/users/staff?role=${role}`,
            {

                method:"POST",

                body:JSON.stringify(user)

            }

        );



        if(response.ok){


            alert("Staff user created successfully");


            loadUsers();


        }
        else{


            const msg = await response.text();

            alert(msg);


        }



    }catch(error){


        console.error(error);

        alert("Failed creating user");


    }


}