/**
 * Phuket App Documentation - Main Application Logic
 * Handles navigation, search, platform switching, and UI interactions
 */

// ============================================================================
// STATE
// ============================================================================

const state = {
    currentPage: 'overview',
    currentPlatform: 'all',
    currentDetailLevel: 'quick',
    searchQuery: '',
    sidebarOpen: false
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    sidebar: null,
    mainContent: null,
    searchInput: null,
    mobileMenuToggle: null,
    mobileOverlay: null,
    mobileSearchBtn: null,
    mobileBottomNav: null,
    bottomNavItems: null,
    platformButtons: null,
    detailButtons: null,
    navItems: null
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    loadPage(state.currentPage);
});

function initElements() {
    elements.sidebar = document.getElementById('sidebar');
    elements.mainContent = document.getElementById('main-content');
    elements.searchInput = document.getElementById('search-input');
    elements.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    elements.mobileOverlay = document.getElementById('mobile-overlay');
    elements.mobileSearchBtn = document.getElementById('mobile-search-btn');
    elements.mobileBottomNav = document.getElementById('mobile-bottom-nav');
    elements.bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    elements.platformButtons = document.querySelectorAll('.platform-btn');
    elements.detailButtons = document.querySelectorAll('.detail-btn');
    elements.navItems = document.querySelectorAll('.nav-item');
}

// Bind click to element
function bindClick(el, handler) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', handler, false);
}

function initEventListeners() {
    // Bottom nav items - direct binding
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        bindClick(item, function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
                updateBottomNavActive(page);
            }
        });
    });

    // Sidebar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        bindClick(item, function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
                closeMobileMenu();
            }
        });
    });

    // Platform buttons
    document.querySelectorAll('.platform-btn').forEach(btn => {
        bindClick(btn, function(e) {
            e.preventDefault();
            const platform = this.dataset.platform;
            if (platform) switchPlatform(platform);
        });
    });

    // Detail level buttons
    document.querySelectorAll('.detail-btn').forEach(btn => {
        bindClick(btn, function(e) {
            e.preventDefault();
            const level = this.dataset.level;
            if (level) switchDetailLevel(level);
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        bindClick(menuToggle, function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }

    // Mobile overlay
    const overlay = document.getElementById('mobile-overlay');
    if (overlay) {
        bindClick(overlay, function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }

    // Mobile search button
    const searchBtn = document.getElementById('mobile-search-btn');
    if (searchBtn) {
        bindClick(searchBtn, function(e) {
            e.preventDefault();
            openMobileMenu();
            setTimeout(() => elements.searchInput?.focus(), 300);
        });
    }

    // Search input
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value.toLowerCase();
            filterNavigation();
        }, 200));

        elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchAndNavigate();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Focus search on Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            elements.searchInput?.focus();
        }
        // Close mobile menu on Escape
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

// ============================================================================
// NAVIGATION
// ============================================================================

function navigateTo(page) {
    if (!CONTENT[page]) {
        console.warn(`Page "${page}" not found`);
        return;
    }

    state.currentPage = page;
    loadPage(page);
    updateActiveNavItem(page);
    closeMobileMenu();

    // Update URL hash for bookmarking
    history.pushState({ page }, '', `#${page}`);
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state?.page) {
        state.currentPage = e.state.page;
        loadPage(e.state.page);
        updateActiveNavItem(e.state.page);
    }
});

// Load page from URL hash on initial load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && CONTENT[hash]) {
        navigateTo(hash);
    }
});

function loadPage(page) {
    const pageData = CONTENT[page];
    if (!pageData) return;

    // Get content based on detail level
    let content = '';
    if (pageData.levels && pageData.levels[state.currentDetailLevel]) {
        content = pageData.levels[state.currentDetailLevel];
    } else if (pageData.content) {
        // Fallback to single content if no levels defined
        content = pageData.content;
    }

    const html = `
        <div class="content-wrapper">
            <header class="page-header">
                <div class="breadcrumb">
                    ${pageData.breadcrumb.map((item, i) =>
                        i === pageData.breadcrumb.length - 1
                            ? `<span>${item}</span>`
                            : `<a href="#">${item}</a><span class="breadcrumb-separator">/</span>`
                    ).join('')}
                </div>
                <h1 class="page-title">
                    ${pageData.title}
                    ${pageData.platform ? `<span class="platform-tag ${pageData.platform}">${pageData.platform.toUpperCase()}</span>` : ''}
                </h1>
                <p class="page-description">${pageData.description}</p>
            </header>
            ${content}
        </div>
    `;

    elements.mainContent.innerHTML = html;

    // Scroll to top
    elements.mainContent.scrollTo(0, 0);

    // Re-initialize any interactive elements in the new content
    initPageInteractions();
}

function updateActiveNavItem(page) {
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    // Also update bottom nav
    updateBottomNavActive(page);
}

function updateBottomNavActive(page) {
    if (!elements.bottomNavItems) return;

    elements.bottomNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
}

// ============================================================================
// PLATFORM SWITCHING
// ============================================================================

function switchPlatform(platform) {
    state.currentPlatform = platform;

    // Update button states
    elements.platformButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.platform === platform) {
            btn.classList.add('active');
        }
    });

    // Show/hide platform-specific sections
    const platformSections = document.querySelectorAll('[data-platform-section]');
    platformSections.forEach(section => {
        const sectionPlatform = section.dataset.platformSection;
        if (platform === 'all') {
            section.style.display = '';
        } else if (sectionPlatform === platform) {
            section.style.display = '';
        } else {
            section.style.display = 'none';
        }
    });

    // Show/hide individual nav items
    const platformItems = document.querySelectorAll('.nav-item[data-platform]');
    platformItems.forEach(item => {
        const itemPlatform = item.dataset.platform;
        if (platform === 'all' || itemPlatform === platform) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============================================================================
// DETAIL LEVEL SWITCHING
// ============================================================================

function switchDetailLevel(level) {
    state.currentDetailLevel = level;

    // Update button states
    elements.detailButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        }
    });

    // Update visible content based on detail level
    const detailContents = document.querySelectorAll('.detail-content');
    detailContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.level === level) {
            content.classList.add('active');
        }
    });

    // Reload page with new detail level
    loadPage(state.currentPage);
}

// ============================================================================
// SEARCH
// ============================================================================

function filterNavigation() {
    const query = state.searchQuery;

    elements.navItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        const page = item.dataset.page;
        const pageData = CONTENT[page];

        let matches = text.includes(query);

        // Also search in page content
        if (!matches && pageData) {
            const contentText = (pageData.title + ' ' + pageData.description + ' ' + pageData.content)
                .toLowerCase()
                .replace(/<[^>]*>/g, ''); // Strip HTML tags
            matches = contentText.includes(query);
        }

        if (query === '' || matches) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Show/hide sections that have no visible items
    const navSections = document.querySelectorAll('.nav-section');
    navSections.forEach(section => {
        const visibleItems = section.querySelectorAll('.nav-item:not([style*="display: none"])');
        if (query !== '' && visibleItems.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

function searchAndNavigate() {
    const query = state.searchQuery;
    if (!query) return;

    // Find first matching page
    for (const [page, data] of Object.entries(CONTENT)) {
        const contentText = (data.title + ' ' + data.description + ' ' + data.content)
            .toLowerCase()
            .replace(/<[^>]*>/g, '');

        if (contentText.includes(query)) {
            navigateTo(page);
            return;
        }
    }
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function toggleMobileMenu() {
    state.sidebarOpen = !state.sidebarOpen;
    updateMobileMenuState();
}

function openMobileMenu() {
    state.sidebarOpen = true;
    updateMobileMenuState();
}

function closeMobileMenu() {
    state.sidebarOpen = false;
    updateMobileMenuState();
}

function updateMobileMenuState() {
    if (state.sidebarOpen) {
        elements.sidebar.classList.add('open');
        elements.mobileMenuToggle?.classList.add('active');
        elements.mobileOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        elements.sidebar.classList.remove('open');
        elements.mobileMenuToggle?.classList.remove('active');
        elements.mobileOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================================================
// PAGE INTERACTIONS
// ============================================================================

function initPageInteractions() {
    // Initialize tabs
    initTabs();

    // Initialize code copy buttons
    initCodeCopy();

    // Initialize card clicks
    initCards();
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tabId) {
    // Update buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Update content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabId}`) {
            content.classList.add('active');
        }
    });
}

function initCodeCopy() {
    const copyButtons = document.querySelectorAll('.code-copy');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            copyCode(btn);
        });
    });
}

function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('pre').textContent;

    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'rgba(0, 255, 0, 0.2)';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function initCards() {
    // Bind clicks on cards with data-page
    document.querySelectorAll('.card[data-page]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });

    // Bind clicks on links with data-page
    document.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
}

// ============================================================================
// UTILITIES
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// EXPANDABLE CARDS
// ============================================================================

function toggleCardExpand(card) {
    // Close other expanded cards
    const allCards = document.querySelectorAll('.card-expandable.expanded');
    allCards.forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
        }
    });

    // Toggle current card
    card.classList.toggle('expanded');
}

// ============================================================================
// EXPANDABLE FEATURES
// ============================================================================

function toggleFeatureExpand(feature) {
    // Close other expanded features
    const allFeatures = document.querySelectorAll('.feature-expandable.expanded');
    allFeatures.forEach(f => {
        if (f !== feature) {
            f.classList.remove('expanded');
        }
    });

    // Toggle current feature
    feature.classList.toggle('expanded');
}

// Make functions globally available for inline onclick handlers
window.navigateTo = navigateTo;
window.switchTab = switchTab;
window.copyCode = copyCode;
window.switchDetailLevel = switchDetailLevel;
window.toggleCardExpand = toggleCardExpand;
window.toggleFeatureExpand = toggleFeatureExpand;
