document.addEventListener('DOMContentLoaded', () => {
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDhgqrrKEETyY3IULUDDa4t1iFY3mGV1o",
  authDomain: "myprofilehb.firebaseapp.com",
  projectId: "myprofilehb",
  storageBucket: "myprofilehb.firebasestorage.app",
  messagingSenderId: "986837010107",
  appId: "1:986837010107:web:1956ba06d1f188515b4b9e",
  measurementId: "G-8G7LV6JESK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


    console.log('Portfolio loaded');

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.95)';
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(15, 23, 42, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
            if (navList.style.display === 'flex') {
                navList.style.flexDirection = 'column';
                navList.style.position = 'absolute';
                navList.style.top = '100%';
                navList.style.left = '0';
                navList.style.width = '100%';
                navList.style.background = 'var(--card-bg)';
                navList.style.padding = '1rem';
                navList.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            }
        });
    }

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // --- ADMIN FEATURES ---

    const adminLoginBtn = document.getElementById('admin-login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    const loginSubmit = document.getElementById('login-submit');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    const addExperienceBtn = document.getElementById('add-experience-btn');
    const addProjectBtn = document.getElementById('add-project-btn');

    // Check for saved content
    loadContent();

    // Open Modal
    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Login Logic
    // Login Logic
    loginSubmit.addEventListener('click', () => {
        const password = adminPasswordInput.value;
        const email = document.getElementById("admin-email").value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                enableAdminMode();
                loginModal.style.display = 'none';
                adminPasswordInput.value = '';
                loginError.style.display = 'none';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                loginError.innerText = "Login failed. Please check your password.";
                loginError.style.display = 'block';
            });
    });

    function enableAdminMode() {
        document.body.classList.add('admin-mode');

        // Show Admin Controls

        document.querySelectorAll('.edit-img-overlay').forEach(el => {
            el.style.display = 'block';
        });
        saveChangesBtn.style.display = 'block';
        addExperienceBtn.style.display = 'block';
        addProjectBtn.style.display = 'block';

        // Make text editable
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });

        // Make lists editable
        const editableLists = document.querySelectorAll('.editable-list');
        editableLists.forEach(list => {
            list.setAttribute('contenteditable', 'true');
        });

        // Add Delete Buttons to existing blocks
        document.querySelectorAll('.editable-block').forEach(block => {
            if (!block.querySelector('.delete-btn')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.onclick = function () {
                    if (confirm('Are you sure you want to delete this block?')) {
                        block.remove();
                    }
                };
                block.appendChild(deleteBtn);
            }
        });

        // Enable Drag and Drop
        enableDragAndDrop();

        alert('Admin Mode Enabled! You can now edit text, add/delete blocks, and drag items to reorder.');
    }

    function disableAdminMode() {
        document.body.classList.remove('admin-mode');

        // Hide Admin Controls

        document.querySelectorAll('.edit-img-overlay').forEach(el => {
            el.style.display = 'none';
        });
        saveChangesBtn.style.display = 'none';
        addExperienceBtn.style.display = 'none';
        addProjectBtn.style.display = 'none';

        // Disable editing
        document.querySelectorAll('.editable, .editable-list').forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Disable Drag and Drop
        document.querySelectorAll('.editable-block').forEach(el => {
            el.removeAttribute('draggable');
            el.removeEventListener('dragstart', handleDragStart);
            el.removeEventListener('dragend', handleDragEnd);
        });

        // Remove container listeners
        const containers = [document.getElementById('experience-list'), document.getElementById('projects-list')];
        containers.forEach(container => {
            container.removeEventListener('dragover', handleDragOver);
        });
    }

    // Drag and Drop Logic
    function enableDragAndDrop() {
        const blocks = document.querySelectorAll('.editable-block');
        blocks.forEach(block => {
            block.setAttribute('draggable', 'true');
            block.addEventListener('dragstart', handleDragStart);
            block.addEventListener('dragend', handleDragEnd);
        });

        const containers = [document.getElementById('experience-list'), document.getElementById('projects-list')];
        containers.forEach(container => {
            container.addEventListener('dragover', handleDragOver);
        });
    }

    function handleDragStart(e) {
        this.classList.add('dragging');
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        const container = this;
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.editable-block:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Save Changes
    saveChangesBtn.addEventListener('click', () => {
        // Disable Admin Mode FIRST to clean up HTML (remove contenteditable, etc.)
        disableAdminMode();

        const data = {};

        // Save text content
        document.querySelectorAll('.editable').forEach(el => {
            if (el.dataset.key) {
                data[el.dataset.key] = el.innerText;
            }
        });

        // Save lists
        document.querySelectorAll('.editable-list').forEach(el => {
            if (el.dataset.key) {
                data[el.dataset.key] = el.innerHTML;
            }
        });

        // Save entire HTML of sections to capture added blocks and new order
        data['experience-html'] = document.getElementById('experience-list').innerHTML;
        data['projects-html'] = document.getElementById('projects-list').innerHTML;

        db.collection('portfolio').doc('data').set(data)
            .then(() => {
                alert('Changes saved successfully to Firebase! Exiting Admin Mode.');
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                alert("Error saving changes. Check console.");
            });
    });

    function loadContent() {
        db.collection('portfolio').doc('data').get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();

                // Restore HTML structure first (for added blocks and order)
                // Use DOMPurify to prevent XSS
                if (data['experience-html']) {
                    document.getElementById('experience-list').innerHTML = DOMPurify.sanitize(data['experience-html'], {ADD_ATTR: ['onclick']});
                }
        if (data['projects-html']) {
            document.getElementById('projects-list').innerHTML = DOMPurify.sanitize(data['projects-html'], {ADD_ATTR: ['onclick']});
        }

        // Clean up any accidental contenteditable attributes from loaded HTML
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });

        // Restore individual text fields
        document.querySelectorAll('.editable').forEach(el => {
            if (el.dataset.key && data[el.dataset.key]) {
                el.innerText = data[el.dataset.key];
            }
        });

        document.querySelectorAll('.editable-list').forEach(el => {
            if (el.dataset.key && data[el.dataset.key]) {
                el.innerHTML = DOMPurify.sanitize(data[el.dataset.key]);
            }
        });
            } else {
                console.log("No saved data found in Firebase.");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }

    // Add Experience Block
    addExperienceBtn.addEventListener('click', () => {
        const list = document.getElementById('experience-list');
        const id = Date.now();
        const newBlock = document.createElement('div');
        newBlock.className = 'timeline-item editable-block';
        newBlock.setAttribute('draggable', 'true'); // Make new block draggable immediately
        newBlock.innerHTML = `
            <button class="delete-btn" onclick="this.parentElement.remove()">&times;</button>
            <div class="timeline-date editable" contenteditable="true" data-key="job-${id}-date">Date</div>
            <div class="timeline-content">
                <h3 class="editable" contenteditable="true" data-key="job-${id}-title">Job Title</h3>
                <h4 class="editable" contenteditable="true" data-key="job-${id}-company">Company Name</h4>
                <p class="location editable" contenteditable="true" data-key="job-${id}-loc">Location</p>
                <ul class="editable-list" contenteditable="true" data-key="job-${id}-desc">
                    <li>Description item...</li>
                </ul>
            </div>
        `;
        list.prepend(newBlock); // Add to top

        // Add drag listeners to new block
        newBlock.addEventListener('dragstart', handleDragStart);
        newBlock.addEventListener('dragend', handleDragEnd);
    });

    // Add Project Block
    addProjectBtn.addEventListener('click', () => {
        const list = document.getElementById('projects-list');
        const id = Date.now();
        const newBlock = document.createElement('article');
        newBlock.className = 'project-card editable-block';
        newBlock.setAttribute('draggable', 'true'); // Make new block draggable immediately
        newBlock.innerHTML = `
            <button class="delete-btn" onclick="this.parentElement.remove()">&times;</button>
            <div class="project-image" style="position: relative;">
                <div class="placeholder-img"></div>
                <img src="" alt="Project Image" class="editable-img-preview" data-key="proj-${id}-img" style="display: none; width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                <div class="edit-img-overlay admin-only" style="display: block; position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 5px; border-radius: 4px; z-index: 10;">
                    <input type="text" class="img-url-input" placeholder="Image URL..." style="display: none; width: 150px; font-size: 12px; padding: 2px;">
                    <button class="btn-edit-img" style="background: none; border: none; color: white; cursor: pointer;"><i class="fas fa-image"></i> Edit</button>
                </div>
            </div>
            <div class="project-info">
                <h3 class="project-title editable" contenteditable="true" data-key="proj-${id}-title">New Project</h3>
                <p class="project-desc editable" contenteditable="true" data-key="proj-${id}-desc">Project description...</p>
                <div class="project-links">
                    <a href="#" class="link-text">View Details &rarr;</a>
                </div>
            </div>
        `;
        list.prepend(newBlock);

        // Add drag listeners to new block
        newBlock.addEventListener('dragstart', handleDragStart);
        newBlock.addEventListener('dragend', handleDragEnd);
    });

    // Global event listener for image editing in Admin Mode
    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('admin-mode')) return;

        if (e.target.closest('.btn-edit-img')) {
            e.preventDefault();
            const btn = e.target.closest('.btn-edit-img');
            const overlay = btn.closest('.edit-img-overlay');
            const input = overlay.querySelector('.img-url-input');
            const imgPreview = overlay.parentElement.querySelector('.editable-img-preview');
            const placeholder = overlay.parentElement.querySelector('.placeholder-img');

            if (input.style.display === 'none') {
                input.style.display = 'block';
                btn.innerHTML = '<i class="fas fa-check"></i> Save';
            } else {
                const url = input.value;
                if (url) {
                    imgPreview.src = url;
                    imgPreview.style.display = 'block';
                    if(placeholder) placeholder.style.display = 'none';
                    // Set src inline style or attr to save to innerHTML
                    imgPreview.setAttribute('src', url);
                } else {
                    imgPreview.src = '';
                    imgPreview.style.display = 'none';
                    imgPreview.removeAttribute('src');
                    if(placeholder) placeholder.style.display = 'block';
                }
                input.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-image"></i> Edit';
            }
        }
    });
});
