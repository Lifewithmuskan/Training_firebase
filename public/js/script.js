document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const mainNav = document.querySelector('.main-nav');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 86, 179, 0.9)';
            navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'var(--primary-color)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Function to change "Introduction" or "Create Test" based on hover
    window.changeToIntroduction = () => {
        document.getElementById("about").innerHTML = "Introduction";
    }

    window.changeToCreateTest = () => {
        document.getElementById("create-test").innerHTML = "Create Test";
    }

    window.changeToAssignTest = () => {
        document.getElementById("assign-test").innerHTML = "Assign Test";
    }

    window.changeToAssignTest = () => {
        document.getElementById("test-submissions").innerHTML = " test result";
    }
    
    window.changeToIntroduction() = () => {
        document.getElementById("new-test").innerHTML = " New-test";
    }
    // Dropdown menu toggle
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Form submission (for newsletter)
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
});