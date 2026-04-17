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

    // Dynamic Data Loading with Firebase Real-time Updates (No fallback to data.json)
    settingsDocRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            console.log("Firebase data updated:", data);
            applyData(data);
        } else {
            console.warn("No Firebase data found in 'siteSettings/mainData'. Please check your Firestore database.");
        }
    }, (err) => {
        console.error("Firestore listener error:", err);
    });

    function applyData(data) {
        // Update Logo
        if(data.logo && document.getElementById('logo-img')) {
            document.getElementById('logo-img').src = data.logo;
        }
        
        // Update Text Content
        const textKeys = ['heroTitle', 'heroSubtitle', 'projectVideoTitle', 'projectVideoSubtitle', 'peacefulVistaTitle', 'peacefulVistaText1', 'peacefulVistaText2', 'infinityLifeTitle', 'infinityLifeSubtitle', 'comfortTitle', 'comfortSubtitle', 'locationTitle', 'locationSubtitle', 'floorPlanTitle', 'floorPlanSubtitle', 'whySpecialTitle', 'whySpecialText1', 'whySpecialText2', 'whySpecialText3', 'contactTitle', 'contactSubtitle'];
        
        textKeys.forEach(key => {
            const el = document.getElementById(key);
            if(el && data[key]) {
                el.innerText = data[key];
            }
        });

        // Update All Static Images
        const imgKeys = ['img_projectVideo', 'img_infinity1', 'img_infinity2', 'img_infinity3', 'img_infinity4', 'img_comfort', 'img_floor1', 'img_floor2'];
        imgKeys.forEach(key => {
            const el = document.getElementById(key);
            if(el && data[key]) {
                el.src = data[key];
            }
        });

        // Handle Banners Slider
        if(data.banners && data.banners.length > 0) {
            const heroSection = document.querySelector('.hero');
            if(heroSection) {
                let currentBannerIdx = 0;
                
                const setBanner = (idx) => {
                    const url = data.banners[idx];
                    console.log(`Setting banner ${idx}: ${url}`);
                    heroSection.style.backgroundImage = `linear-gradient(rgba(0,59,34,0.3), rgba(0,59,34,0.3)), url('${url}')`;
                    heroSection.style.backgroundSize = 'cover';
                    heroSection.style.backgroundPosition = 'center';
                    heroSection.style.backgroundRepeat = 'no-repeat';
                };

                setBanner(currentBannerIdx);
                
                // Clear existing intervals
                if(window.bannerInterval) clearInterval(window.bannerInterval);
                
                if(data.banners.length > 1) {
                    window.bannerInterval = setInterval(() => {
                        currentBannerIdx = (currentBannerIdx + 1) % data.banners.length;
                        setBanner(currentBannerIdx);
                    }, 5000);
                }
            }
        }

        // Handle Gallery
        if(data.gallery && data.gallery.length > 0) {
            const gSection = document.getElementById('dynamic-gallery-section');
            const gContainer = document.getElementById('dynamic-gallery-container');
            if(gSection && gContainer) {
                gSection.style.display = 'block';
                gContainer.innerHTML = ''; // Clear existing
                data.gallery.forEach(url => {
                    const isVid = url.match(/\.(mp4|webm)$/i) || url.includes('/video/upload/');
                    if(isVid) {
                        gContainer.innerHTML += `<video src="${url}" controls style="max-width:300px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></video>`;
                    } else {
                        gContainer.innerHTML += `<img src="${url}" style="max-width:300px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">`;
                    }
                });
            }
        }
    }
});
