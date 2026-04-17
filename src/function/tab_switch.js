const navItems = document.querySelectorAll('.profile-nav li[data-tab]');
        const viewDefault = document.getElementById('view-default');
        const viewCollaborators = document.getElementById('view-collaborators');
        const sidebar = document.getElementById('sidebar');

        function isMobile() {
            return window.innerWidth <= 768;
        }

        function switchTab(tab) {
            navItems.forEach(i => i.classList.remove('active'));
            document.querySelector(`.profile-nav li[data-tab="${tab}"]`).classList.add('active');

            if (tab === 'collaborators') {
                viewDefault.style.display = 'none';
                viewCollaborators.style.display = 'block';
            } else if (tab === 'about' && isMobile()) {
                viewDefault.style.display = 'grid';
                viewCollaborators.style.display = 'none';
                sidebar.style.display = 'flex';
                sidebar.querySelector('.main-content') && (sidebar.querySelector('.main-content').style.display = 'none');
                document.querySelector('.main-content').style.display = 'none';
            } else {
                viewDefault.style.display = '';
                viewCollaborators.style.display = 'none';
                if (isMobile()) {
                    sidebar.style.display = 'none';
                    document.querySelector('.main-content').style.display = 'flex';
                } else {
                    sidebar.style.display = '';
                    document.querySelector('.main-content').style.display = '';
                }
            }
        }

        function switchToCollaboratorsTab() {
            switchTab('collaborators');
        }

        navItems.forEach(li => {
            li.addEventListener('click', (e) => {
                e.preventDefault();
                switchTab(li.dataset.tab);
            });
        });

        document.getElementById('see-all-collabs').addEventListener('click', (e) => {
            e.preventDefault();
            switchToCollaboratorsTab();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Filter dropdown
        const filterBtn = document.getElementById('filter-btn');
        const filterDropdown = document.getElementById('filter-dropdown');

        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => filterDropdown.classList.remove('open'));

        document.querySelectorAll('.filter-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.filter-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                filterDropdown.classList.remove('open');

                const filter = opt.dataset.filter;
                document.querySelectorAll('.project-card').forEach(card => {
                    const match = filter === 'all' || card.dataset.category === filter;
                    card.style.display = match ? '' : 'none';
                });
            });
        });
