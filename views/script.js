document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
  
    // Login Form
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
  
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const result = await response.json();
        if (result.token) {
          localStorage.setItem("token", result.token);
          alert("Login successful!");
          window.location.href = "/profile.html";
        } else {
          alert(result.message);
        }
      });
    }
  
    // Signup Form
    
// Signup Form
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();
        if (result.message === "User registered successfully") {
            alert(result.message);
            window.location.href = "/login.html";  // Redirect to login page after successful signup
        } else {
            alert(result.message);
        }
    });
}

});