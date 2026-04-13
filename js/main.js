document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    // Toggle Mobile Menu
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if(navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
            }
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if(targetElement) {
                // Adjust for sticky header
                const headerOffset = 65;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Refresh captcha action (placeholder)
    const captchaReload = document.querySelector(".captchareload");
    if(captchaReload) {
        captchaReload.addEventListener("click", () => {
            console.log("Captcha reloaded");
            // Placeholder for real logic
        });
    }
});
