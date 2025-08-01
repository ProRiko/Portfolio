// --- Basic Page Interactivity ---

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu ? mobileMenu.getElementsByTagName('a') : [];
    for (let link of mobileLinks) {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    }

    // Scroll animations for sections
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Gemini API Integration ---
    
    const enhanceButtons = document.querySelectorAll('.enhance-btn');
    const aiModal = document.getElementById('ai-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalBtnBottom = document.getElementById('close-modal-btn-bottom');
    const modalLoader = document.getElementById('modal-loader');
    const modalResult = document.getElementById('modal-result');
    const modalError = document.getElementById('modal-error');
    const aiDescription = document.getElementById('ai-description');

    // Function to open the modal
    const openModal = () => {
        if (aiModal) {
            aiModal.classList.remove('hidden');
            // Reset states
            if (modalLoader) modalLoader.style.display = 'block';
            if (modalResult) modalResult.classList.add('hidden');
            if (modalError) modalError.classList.add('hidden');
            if (aiDescription) aiDescription.textContent = '';
        }
    };

    // Function to close the modal
    const closeModal = () => {
        if (aiModal) {
            aiModal.classList.add('hidden');
        }
    };

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(closeModalBtnBottom) closeModalBtnBottom.addEventListener('click', closeModal);

    // Add click listener to all enhance buttons
    enhanceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            const title = card.querySelector('h3').innerText;
            const description = card.querySelector('p').innerText;
            const techStackSpans = card.querySelectorAll('.tech-stack span');
            const techStack = Array.from(techStackSpans).map(span => span.innerText).join(', ');

            openModal();
            generateEnhancedDescription(title, description, techStack);
        });
    });

    /**
     * Generates an enhanced project description using the Gemini API.
     * @param {string} title - The project title.
     * @param {string} description - The original project description.
     * @param {string} techStack - The technologies used.
     */
    async function generateEnhancedDescription(title, description, techStack) {
        const apiKey = ""; // This will be handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const prompt = `You are an expert tech portfolio assistant. Your task is to rewrite a project description to make it more professional, detailed, and impactful for a potential employer.
        
        Based on the following project details, generate a new description of 3-4 sentences. Expand on the potential applications, technical challenges that might have been overcome, and the overall significance of the project.
        
        Project Title: "${title}"
        Original Description: "${description}"
        Technologies Used: ${techStack}
        
        Generate the enhanced description now.`;
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        
        let retries = 3;
        let delay = 1000;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    
                    const text = result.candidates[0].content.parts[0].text;
                    if (aiDescription) aiDescription.textContent = text.trim();
                    if (modalLoader) modalLoader.style.display = 'none';
                    if (modalResult) modalResult.classList.remove('hidden');
                    return; // Success, exit the loop
                } else {
                     throw new Error("Invalid response structure from API.");
                }

            } catch (error) {
                console.error('Error fetching from Gemini API:', error);
                if (i === retries - 1) {
                    // Last retry failed
                    if (modalLoader) modalLoader.style.display = 'none';
                    if (modalError) modalError.classList.remove('hidden');
                } else {
                    // Wait before retrying
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2; // Exponential backoff
                }
            }
        }
    }
});
