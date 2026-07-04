var supabase = window.supabase.createClient(
  'https://urhksjbmmesfibcgeeal.supabase.co',
  'sb_publishable__fqO70p_nvCHHAZgdK1jPQ_H3tn8jR3'
);

console.log(supabase);

async function register() {
    event.preventDefault();

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var password = document.getElementById("password").value;
    var cpassword = document.getElementById("cpassword").value;

    if (!name) {
        Swal.fire({
            icon: "warning",
            title: "Name Required",
            text: "Please enter your name."
        });
        return;
    }

    if (password !== cpassword) {
        Swal.fire({
            icon: "error",
            title: "Password Mismatch",
            text: "Passwords should be identical."
        });
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        console.log(data);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: error.message
            });
            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Success!",
            text: `${name} Registered Successfully`,
            timer: 2000,
            showConfirmButton: false
        });

        window.location.href = "/dashboard.html";

    } catch (error) {
        console.log(error);

        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: error.message
        });
    }
}

async function login() {
    event.preventDefault();

    var loginEmail = document.getElementById("loginEmail").value;
    var loginPass = document.getElementById("loginPass").value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPass,
        });

        console.log(data);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message
            });
            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Welcome back!",
            timer: 2000,
            showConfirmButton: false
        });

        window.location.href = "./dashboard.html";

    } catch (error) {
        console.log(error);

        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: error.message
        });
    }
}

function logout() {

    Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "/";
    });

}

window.register = register;
window.login = login;