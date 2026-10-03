// SYNAPSE TECH JOURNAL - Core Application Controller with SPA Browser History & Back Button Support

class BlogApp {
  constructor() {
    if (localStorage.getItem('synapse_v5_concepts_loaded') !== 'true') {
      localStorage.removeItem('synapse_articles');
      localStorage.setItem('synapse_v5_concepts_loaded', 'true');
    }

    this.articles = this.loadArticles();
    this.bookmarks = this.loadBookmarks();
    this.currentCategory = 'All';
    this.searchQuery = '';
    this.sortBy = 'latest';
    this.currentArticle = null;
    this.isAudioPlaying = false;
    this.audioInterval = null;

    this.init();
  }

  loadArticles() {
    const saved = localStorage.getItem('synapse_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_ARTICLES.length) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved articles", e);
      }
    }
    return [...INITIAL_ARTICLES];
  }

  saveArticles() {
    localStorage.setItem('synapse_articles', JSON.stringify(this.articles));
  }

  loadBookmarks() {
    const saved = localStorage.getItem('synapse_bookmarks');
    return saved ? JSON.parse(saved) : [];
  }

  saveBookmarks() {
    localStorage.setItem('synapse_bookmarks', JSON.stringify(this.bookmarks));
    this.updateBookmarkCountBadge();
  }

  init() {
    this.initTheme();
    this.renderTicker();
    this.renderHeroShowcase();
    this.renderArticles();
    this.renderLeaderboard();
    this.renderHardwareDeals();
    this.updateBookmarkCountBadge();
    this.bindEvents();
    this.initHistoryRouting();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('synapse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('synapse_theme', next);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
    }
    this.showToast(`Switched to ${next.toUpperCase()} interface`);
  }

  // ==========================================
  // SPA Browser History & Back Button Support
  // ==========================================
  initHistoryRouting() {
    // Handle Browser Back / Forward buttons
    window.addEventListener('popstate', (e) => {
      this.handleRouteFromHash();
    });

    // Check initial URL hash on page load
    this.handleRouteFromHash(true);
  }

  handleRouteFromHash(isInitial = false) {
    const hash = window.location.hash;

    // Check what is currently open
    const articleModal = document.getElementById('articleModal');
    const conceptModal = document.getElementById('conceptModal');
    const bookmarksDrawer = document.getElementById('bookmarksDrawer');
    const mobileDrawer = document.getElementById('mobileDrawerOverlay');

    if (!hash || hash === '#' || hash === '#home') {
      // Close all overlays
      if (conceptModal && conceptModal.classList.contains('active')) {
        conceptModal.classList.remove('active');
      }
      if (articleModal && articleModal.classList.contains('active')) {
        articleModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.stopAudioReader();
      }
      if (bookmarksDrawer && bookmarksDrawer.classList.contains('active')) {
        bookmarksDrawer.classList.remove('active');
      }
      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
      return;
    }

    if (hash.startsWith('#article=')) {
      const articleId = hash.replace('#article=', '');
      if (conceptModal && conceptModal.classList.contains('active')) {
        conceptModal.classList.remove('active');
      }
      this.openArticleModal(articleId, false);
      return;
    }

    if (hash.startsWith('#concept=')) {
      const conceptKey = hash.replace('#concept=', '');
      this.openConcept(conceptKey, false);
      return;
    }

    if (hash.startsWith('#category=')) {
      const cat = decodeURIComponent(hash.replace('#category=', ''));
      if (conceptModal) conceptModal.classList.remove('active');
      if (articleModal) {
        articleModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
      this.setCategory(cat, false);
      return;
    }

    if (hash === '#bookmarks') {
      this.toggleBookmarksDrawer(true, false);
      return;
    }
  }

  toggleMobileMenu(open, updateHistory = true) {
    const overlay = document.getElementById('mobileDrawerOverlay');
    if (!overlay) return;
    const shouldOpen = open !== undefined ? open : !overlay.classList.contains('active');
    if (shouldOpen) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (updateHistory) history.pushState({ type: 'mobileMenu' }, '', '#menu');
    } else {
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      if (updateHistory && window.location.hash === '#menu') history.back();
    }
  }

  selectMobileCategory(cat) {
    this.toggleMobileMenu(false, false);
    this.setCategory(cat);
    window.scrollTo({ top: document.getElementById('mainArticlesSection').offsetTop - 60, behavior: 'smooth' });
  }

  renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;
    const items = [...BREAKING_NEWS_TICKER, ...BREAKING_NEWS_TICKER];
    track.innerHTML = items.map(t => `<span>${t}</span>`).join('');
  }

  renderHeroShowcase() {
    const leadContainer = document.getElementById('heroLeadCard');
    const subContainer = document.getElementById('heroSubGrid');
    if (!leadContainer || !subContainer) return;

    let candidateArticles = this.articles;
    if (this.currentCategory !== 'All') {
      candidateArticles = this.articles.filter(a => a.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    const lead = candidateArticles[0] || this.articles[0];
    const subStories = candidateArticles.slice(1, 3);

    // Render Lead
    leadContainer.innerHTML = `
      <img src="${lead.image}" alt="${lead.title}" class="hero-bg-img" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="card-badge-row">
          <span class="badge-tag">${lead.badge || lead.category}</span>
          ${lead.score ? `<span class="badge-score-pill">★ IMPACT ${lead.score}/100</span>` : ''}
          ${lead.gallery && lead.gallery.length > 1 ? `<span class="badge-gallery-count">📷 ${lead.gallery.length} Photos</span>` : ''}
          <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">${lead.tag}</span>
        </div>
        <h1 class="hero-title">${lead.title}</h1>
        <p class="hero-subtitle">${lead.subtitle}</p>
        <div class="meta-row">
          <div class="author-chip">
            <img src="${lead.author.avatar}" alt="${lead.author.name}" class="author-avatar" />
            <span>${lead.author.name}</span>
          </div>
          <span>•</span>
          <span>${lead.date}</span>
          <span>•</span>
          <span>⏱️ ${lead.readTime}</span>
        </div>
      </div>
    `;
    leadContainer.onclick = () => this.openArticleModal(lead.id);

    // Render Sub Stories
    subContainer.innerHTML = subStories.map(sub => `
      <div class="hero-sub-card" onclick="app.openArticleModal('${sub.id}')">
        <img src="${sub.image}" alt="${sub.title}" class="hero-bg-img" />
        <div class="hero-overlay"></div>
        <div class="card-badge-row" style="position: relative; z-index: 2;">
          <span class="badge-tag">${sub.badge || sub.category}</span>
          ${sub.score ? `<span class="badge-score-pill">★ ${sub.score}</span>` : ''}
          ${sub.gallery && sub.gallery.length > 1 ? `<span class="badge-gallery-count">📷 ${sub.gallery.length}</span>` : ''}
        </div>
        <h2 class="sub-title">${sub.title}</h2>
        <div class="meta-row" style="position: relative; z-index: 2; font-size: 0.75rem;">
          <span>${sub.author.name}</span>
          <span>•</span>
          <span>${sub.readTime}</span>
        </div>
      </div>
    `).join('');
  }

  getFilteredArticles() {
    return this.articles.filter(article => {
      const matchesCategory = this.currentCategory === 'All' || article.category.toLowerCase() === this.currentCategory.toLowerCase();
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !this.searchQuery || 
        article.title.toLowerCase().includes(query) ||
        article.subtitle.toLowerCase().includes(query) ||
        article.tag.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (this.sortBy === 'rated') {
        return (b.score || 0) - (a.score || 0);
      }
      if (this.sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0;
    });
  }

  renderArticles() {
    const grid = document.getElementById('articlesFeedGrid');
    const countDisplay = document.getElementById('articleResultCount');
    const headingDisplay = document.getElementById('feedTitleHeading');
    if (!grid) return;

    const filtered = this.getFilteredArticles();
    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} dispatches in ${this.currentCategory}`;
    }
    if (headingDisplay) {
      headingDisplay.textContent = this.currentCategory === 'All' ? 'Frontier Intelligence Feed' : `${this.currentCategory} Dispatches`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px 20px; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-active);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔬</div>
          <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px;">No research dispatches found</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Try adjusting search keywords or selecting another scientific domain.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(article => {
      const isBookmarked = this.bookmarks.includes(article.id);
      const galleryCount = article.gallery ? article.gallery.length : 1;
      return `
        <article class="article-card" onclick="app.openArticleModal('${article.id}')">
          <div class="article-thumb-wrap">
            <img src="${article.image}" alt="${article.title}" class="article-thumb" loading="lazy" />
            <div class="thumb-badges">
              <span class="badge-tag">${article.category}</span>
              ${galleryCount > 1 ? `<span class="badge-gallery-count">📷 ${galleryCount} Photos</span>` : ''}
            </div>
            ${article.score ? `<div class="score-badge">${article.score}</div>` : ''}
          </div>
          <div class="article-body">
            <div style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">
              ${article.tag}
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.subtitle || article.summary}</p>
            <div class="article-footer">
              <div class="author-chip">
                <img src="${article.author.avatar}" alt="${article.author.name}" class="author-avatar" />
                <span>${article.author.name}</span>
              </div>
              <div class="article-actions" onclick="event.stopPropagation()">
                <button class="action-btn-mini ${isBookmarked ? 'bookmarked' : ''}" title="Bookmark" onclick="app.toggleBookmark('${article.id}')">
                  ${isBookmarked ? '🔖' : '📑'}
                </button>
                <button class="action-btn-mini" onclick="app.likeArticle('${article.id}')">
                  ⚡ <span id="like-count-${article.id}">${article.likes || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  setCategory(categoryName, updateHistory = true) {
    this.currentCategory = categoryName;

    document.querySelectorAll('.nav-link').forEach(link => {
      const linkCat = link.getAttribute('data-cat');
      if (linkCat && linkCat.toLowerCase() === categoryName.toLowerCase()) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    document.querySelectorAll('.cat-pill').forEach(pill => {
      const pillCat = pill.getAttribute('data-category');
      if (pillCat && pillCat.toLowerCase() === categoryName.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      const mCat = item.getAttribute('data-mobile-cat');
      if (mCat && mCat.toLowerCase() === categoryName.toLowerCase()) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (updateHistory) {
      const hash = categoryName === 'All' ? '#home' : `#category=${encodeURIComponent(categoryName)}`;
      history.pushState({ type: 'category', cat: categoryName }, '', hash);
    }

    this.renderHeroShowcase();
    this.renderArticles();
  }

  renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    const items = typeof LEADERBOARD_TECH !== 'undefined' ? LEADERBOARD_TECH : [];
    list.innerHTML = items.map(g => `
      <div class="leaderboard-item">
        <div class="leaderboard-rank ${g.rank === 1 ? 'top-1' : ''}">${g.rank}</div>
        <div class="leaderboard-info">
          <div class="leaderboard-title">${g.title}</div>
          <div class="leaderboard-genre">${g.genre} • <span style="color: var(--accent-cyan);">${g.change}</span></div>
        </div>
        <div class="leaderboard-score">${g.rating}</div>
      </div>
    `).join('');
  }

  renderHardwareDeals() {
    const list = document.getElementById('dealsList');
    if (!list) return;
    list.innerHTML = HARDWARE_DEALS.map(d => `
      <div class="deal-item">
        <h4>${d.item}</h4>
        <div class="deal-price-row">
          <span class="deal-price">${d.price}</span>
          <span class="deal-discount">${d.discount} OFF</span>
        </div>
      </div>
    `).join('');
  }

  toggleBookmark(id) {
    if (this.bookmarks.includes(id)) {
      this.bookmarks = this.bookmarks.filter(bId => bId !== id);
      this.showToast("Removed from saved briefings");
    } else {
      this.bookmarks.push(id);
      this.showToast("Saved to reading briefings 🔖");
    }
    this.saveBookmarks();
    this.renderArticles();
    this.renderBookmarksDrawer();
  }

  updateBookmarkCountBadge() {
    const badge = document.getElementById('bookmarkCountBadge');
    if (badge) {
      badge.textContent = this.bookmarks.length;
      badge.style.display = this.bookmarks.length > 0 ? 'inline-block' : 'none';
    }
  }

  likeArticle(id) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return;
    article.likes = (article.likes || 0) + 1;
    this.saveArticles();
    const countSpan = document.getElementById(`like-count-${id}`);
    if (countSpan) countSpan.textContent = article.likes;
    this.showToast("⚡ Endorsed research finding!");
  }

  generateRichContent(article) {
    const conceptMap = [
      { key: "topological-qubits", label: "Topological Majorana Qubits" },
      { key: "backside-power", label: "Backside Power Delivery (PowerVia)" },
      { key: "liquid-neural-networks", label: "Liquid Neural Networks" },
      { key: "stellarator-fusion", label: "Stellarator Magnetic Confinement" },
      { key: "magnetoencephalography", label: "Non-Invasive MEG Sensing" },
      { key: "solid-state-batteries", label: "Sulfide Solid-State Electrolytes" },
      { key: "spatial-micro-oled", label: "8K Micro-OLED Silicon Optics" },
      { key: "zero-knowledge-proofs", label: "zk-SNARK Cryptography" }
    ];

    let prose = article.content || `<p class="lead-paragraph">${article.summary}</p>`;

    if (prose.length < 500) {
      prose = `
        <p class="lead-paragraph">${article.summary} This breakthrough represents a major technological inflection point, challenging historical assumptions regarding physical limits, compute scaling, and energy density.</p>
        
        <h2>1. Architectural & Engineering Foundations</h2>
        <p>At the microscopic level, implementation requires unprecedented precision. By leveraging <a href="javascript:void(0)" class="concept-link" onclick="app.openConcept('topological-qubits')">Topological Majorana Qubits</a> alongside advanced <a href="javascript:void(0)" class="concept-link" onclick="app.openConcept('backside-power')">Backside Power Delivery</a>, parasitic capacitances are drastically attenuated.</p>
        
        <div class="verdict-box" style="margin: 20px 0;">
          <div class="verdict-header">
            <div class="verdict-score">${article.score || 94}<span>/100</span></div>
            <div class="verdict-summary">
              <h3>SYNAPSE LABORATORY EVALUATION</h3>
              <p>Peer-verified experimental reproducibility confirmed across calibrated cryogenic testbeds.</p>
            </div>
          </div>
          <div class="verdict-grid">
            <div class="pros">
              <h4>+ DEMONSTRATED STRENGTHS</h4>
              <ul>
                <li>Sub-millisecond latency telemetry verification</li>
                <li>Zero-degradation operational longevity under thermal stress</li>
                <li>Seamless integration with existing industrial fabric</li>
              </ul>
            </div>
            <div class="cons">
              <h4>- INDUSTRIAL ROADMAP CHALLENGES</h4>
              <ul>
                <li>Initial foundry wafer manufacturing costs</li>
                <li>Specialized high-vacuum assembly protocols required</li>
              </ul>
            </div>
          </div>
        </div>

        <h2>2. Mathematical Modeling & Real-Time Telemetry</h2>
        <p>Using <a href="javascript:void(0)" class="concept-link" onclick="app.openConcept('liquid-neural-networks')">Liquid Neural Networks</a> and adaptive solvers, real-time feedback loops maintain resonance stability. In lab stress tests, the system operated uninterrupted for over 1,000 continuous hours without drift anomalies.</p>

        <blockquote>
          "We are seeing physical boundaries dissolve. Technologies that were theoretically constrained to supercomputing clusters are now operating with sub-watt power profiles."
        </blockquote>

        <h2>3. Commercialization & Global Socioeconomic Impact</h2>
        <p>Deploying this technology at enterprise scale promises to reduce operational energy expenditures by up to 65%. Protected by <a href="javascript:void(0)" class="concept-link" onclick="app.openConcept('zero-knowledge-proofs')">zk-SNARK Cryptography</a>, sensitive telemetry remains mathematically verified without leaking proprietary operational parameters.</p>
      `;
    }

    const conceptChipsHTML = `
      <div style="margin: 24px 0 16px 0; padding: 14px; background: #0c1017; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <div style="font-family: var(--font-display); font-weight: 800; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
          🔬 Clickable Deep-Dive Concepts in this Dispatch:
        </div>
        <div>
          ${conceptMap.map(c => `
            <span class="concept-chip" onclick="app.openConcept('${c.key}')">
              ⚡ ${c.label}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    return prose + conceptChipsHTML;
  }

  openArticleModal(id, updateHistory = true) {
    const article = this.articles.find(a => a.id === id);
    if (!article) return;
    this.currentArticle = article;

    const modal = document.getElementById('articleModal');
    const heroImg = document.getElementById('modalHeroImg');
    const categoryBadge = document.getElementById('modalCategoryBadge');
    const scorePill = document.getElementById('modalScorePill');
    const title = document.getElementById('modalTitle');
    const subtitle = document.getElementById('modalSubtitle');
    const authorAvatar = document.getElementById('modalAuthorAvatar');
    const authorName = document.getElementById('modalAuthorName');
    const authorRole = document.getElementById('modalAuthorRole');
    const date = document.getElementById('modalDate');
    const readTime = document.getElementById('modalReadTime');
    const content = document.getElementById('modalArticleContent');
    const relatedSection = document.getElementById('modalRelatedSection');

    heroImg.src = article.image;
    categoryBadge.textContent = article.badge || article.category;
    if (scorePill) {
      scorePill.textContent = article.score ? `★ IMPACT ${article.score}/100` : `★ PEER VERIFIED`;
    }
    title.textContent = article.title;
    subtitle.textContent = article.subtitle || '';
    authorAvatar.src = article.author.avatar;
    authorName.textContent = article.author.name;
    authorRole.textContent = article.author.role || 'Senior Researcher';
    date.textContent = article.date;
    readTime.textContent = `⏱️ ${article.readTime}`;

    let galleryHTML = '';
    if (article.gallery && article.gallery.length > 1) {
      galleryHTML = `
        <div style="margin: 20px 0;">
          <h4 style="font-family: var(--font-display); font-size: 0.95rem; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 8px;">
            📸 Field Gallery & Lab Imagery (${article.gallery.length} Photos)
          </h4>
          <div class="modal-gallery-strip">
            ${article.gallery.map(imgUrl => `
              <div class="modal-gallery-item" onclick="window.open('${imgUrl}', '_blank')">
                <img src="${imgUrl}" alt="Lab Imagery" />
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    content.innerHTML = this.generateRichContent(article) + galleryHTML;

    const relatedArticles = this.articles
      .filter(a => a.id !== article.id && (a.category === article.category || a.score > 94))
      .slice(0, 3);

    if (relatedSection) {
      relatedSection.innerHTML = `
        <h3 style="font-family: var(--font-display); font-size: 1.1rem; color: #fff; text-transform: uppercase; margin-bottom: 10px;">
          📑 Related Frontier Research Dispatches
        </h3>
        <div class="related-grid">
          ${relatedArticles.map(r => `
            <div class="related-card" onclick="app.openArticleModal('${r.id}')">
              <span style="font-size: 0.65rem; color: var(--accent-cyan); font-weight: 800; text-transform: uppercase;">${r.category}</span>
              <h4 style="font-size: 0.85rem; color: var(--text-main); margin: 4px 0 6px 0; line-height: 1.3;">${r.title}</h4>
              <span style="font-size: 0.7rem; color: var(--text-dim);">By ${r.author.name} • ⏱️ ${r.readTime}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.renderComments(article);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (updateHistory) {
      history.pushState({ type: 'article', id: article.id }, '', `#article=${article.id}`);
    }

    const container = document.getElementById('modalContainer');
    const progressBar = document.getElementById('readingProgressBar');
    container.onscroll = () => {
      const scrollTotal = container.scrollHeight - container.clientHeight;
      const progress = scrollTotal > 0 ? (container.scrollTop / scrollTotal) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    };
  }

  closeArticleModal(updateHistory = true) {
    const modal = document.getElementById('articleModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    this.stopAudioReader();
    if (updateHistory && window.location.hash.startsWith('#article=')) {
      history.back();
    }
  }

  openConcept(conceptKey, updateHistory = true) {
    const concept = typeof CONCEPT_GLOSSARY !== 'undefined' ? CONCEPT_GLOSSARY[conceptKey] : null;
    if (!concept) {
      this.showToast(`Concept Deep Dive: ${conceptKey}`);
      return;
    }

    const modal = document.getElementById('conceptModal');
    const img = document.getElementById('conceptModalImg');
    const badge = document.getElementById('conceptModalBadge');
    const title = document.getElementById('conceptModalTitle');
    const summary = document.getElementById('conceptModalSummary');
    const mechanism = document.getElementById('conceptModalMechanism');
    const metricsContainer = document.getElementById('conceptModalMetrics');
    const actionBtn = document.getElementById('conceptModalActionBtn');

    img.src = concept.image;
    badge.textContent = concept.badge;
    title.textContent = concept.term;
    summary.textContent = concept.summary;
    mechanism.textContent = concept.mechanism;

    metricsContainer.innerHTML = `
      <div class="metric-grid">
        ${concept.metrics.map(m => `
          <div class="metric-card">
            <div class="metric-label">${m.label}</div>
            <div class="metric-val">${m.value}</div>
          </div>
        `).join('')}
      </div>
    `;

    actionBtn.onclick = () => {
      this.closeConceptModal(false);
      if (concept.relatedArticleId) {
        this.openArticleModal(concept.relatedArticleId);
      }
    };

    modal.classList.add('active');

    if (updateHistory) {
      history.pushState({ type: 'concept', key: conceptKey }, '', `#concept=${conceptKey}`);
    }
  }

  closeConceptModal(updateHistory = true) {
    const modal = document.getElementById('conceptModal');
    if (modal) modal.classList.remove('active');
    if (updateHistory && window.location.hash.startsWith('#concept=')) {
      history.back();
    }
  }

  toggleAudioReader() {
    const btn = document.getElementById('audioPlayBtn');
    const status = document.getElementById('audioStatusText');
    if (this.isAudioPlaying) {
      this.stopAudioReader();
    } else {
      this.isAudioPlaying = true;
      btn.innerHTML = '⏸';
      status.textContent = 'Streaming Neural Voice Synthesis...';
      this.showToast("🎙️ Neural audio synthesis active");
      let count = 0;
      this.audioInterval = setInterval(() => {
        count++;
        if (count >= 15) {
          this.stopAudioReader();
          this.showToast("Briefing playback complete");
        }
      }, 1000);
    }
  }

  stopAudioReader() {
    this.isAudioPlaying = false;
    if (this.audioInterval) clearInterval(this.audioInterval);
    const btn = document.getElementById('audioPlayBtn');
    const status = document.getElementById('audioStatusText');
    if (btn) btn.innerHTML = '▶';
    if (status) status.textContent = 'Listen to this briefing (AI Neural Voice)';
  }

  addReaction(emoji) {
    this.showToast(`Logged reaction: ${emoji}!`);
  }

  renderComments(article) {
    const list = document.getElementById('modalCommentsList');
    if (!list) return;
    const comments = article.comments || [
      { user: "QuantumPhysicist_ETH", time: "1 hour ago", text: "The topological error suppression metrics match the simulated Majorana threshold." },
      { user: "SiliconArch_TSMC", time: "4 hours ago", text: "Backside power routing is proving to be the single biggest silicon leap in a decade." }
    ];
    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-header" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 700; color: var(--accent-cyan); font-size: 0.8rem;">🧬 ${c.user}</span>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${c.time}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-main);">${c.text}</p>
      </div>
    `).join('');
  }

  postComment() {
    const input = document.getElementById('commentInput');
    if (!input || !input.value.trim() || !this.currentArticle) return;
    
    if (!this.currentArticle.comments) {
      this.currentArticle.comments = [];
    }
    this.currentArticle.comments.unshift({
      user: "Researcher_" + Math.floor(Math.random() * 900 + 100),
      time: "Just now",
      text: input.value.trim()
    });
    input.value = '';
    this.saveArticles();
    this.renderComments(this.currentArticle);
    this.showToast("Peer comment posted to dispatch! 💬");
  }

  toggleBookmarksDrawer(open = true, updateHistory = true) {
    const drawer = document.getElementById('bookmarksDrawer');
    if (open) {
      this.renderBookmarksDrawer();
      drawer.classList.add('active');
      if (updateHistory) history.pushState({ type: 'bookmarks' }, '', '#bookmarks');
    } else {
      drawer.classList.remove('active');
      if (updateHistory && window.location.hash === '#bookmarks') history.back();
    }
  }

  renderBookmarksDrawer() {
    const container = document.getElementById('drawerBookmarkList');
    if (!container) return;
    const bookmarkedArticles = this.articles.filter(a => this.bookmarks.includes(a.id));

    if (bookmarkedArticles.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">📑</div>
          <p style="font-size: 0.85rem;">No saved briefings yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = bookmarkedArticles.map(a => `
      <div class="leaderboard-item" style="cursor: pointer;" onclick="app.toggleBookmarksDrawer(false, false); app.openArticleModal('${a.id}');">
        <img src="${a.image}" style="width: 44px; height: 44px; border-radius: 4px; object-fit: cover;" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.8rem; line-height: 1.25; margin-bottom: 2px;">${a.title}</h4>
          <span style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700;">${a.category}</span>
        </div>
        <button class="action-btn-mini" onclick="event.stopPropagation(); app.toggleBookmark('${a.id}')" title="Remove">✕</button>
      </div>
    `).join('');
  }

  openCreateModal() {
    document.getElementById('createModal').classList.add('active');
  }

  closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
  }

  handleCreateArticle(e) {
    e.preventDefault();
    const title = document.getElementById('newTitle').value.trim();
    const category = document.getElementById('newCategory').value;
    const tag = document.getElementById('newTag').value.trim() || 'AI / Quantum';
    const score = document.getElementById('newScore').value ? parseInt(document.getElementById('newScore').value) : null;
    const image = document.getElementById('newImage').value.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80';
    const summary = document.getElementById('newSummary').value.trim();
    const content = document.getElementById('newContent').value.trim();
    const authorName = document.getElementById('newAuthor').value.trim() || 'Guest Researcher';

    const newPost = {
      id: `post-${Date.now()}`,
      title,
      subtitle: summary,
      category,
      tag,
      badge: "COMMUNITY DISPATCH",
      score,
      author: {
        name: authorName,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        role: "Contributing Fellow"
      },
      date: "Today",
      readTime: "4 min read",
      image,
      gallery: [image],
      featured: false,
      trending: true,
      views: "1.5K",
      likes: 18,
      summary,
      content: `<p class="lead-paragraph">${summary}</p><p>${content.replace(/\n/g, '<br/>')}</p>`
    };

    this.articles.unshift(newPost);
    this.saveArticles();
    this.renderArticles();
    this.closeCreateModal();
    this.showToast("🚀 Dispatch published to Synapse Network!");
    e.target.reset();
  }

  votePoll(optionIndex) {
    const bars = document.querySelectorAll('.poll-bar');
    const percentages = [68, 22, 10];
    bars.forEach((bar, idx) => {
      bar.style.width = `${percentages[idx]}%`;
    });
    this.showToast("Scientific consensus recorded! 📊");
  }

  showToast(msg) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0d1117;
        color: #fff;
        border: 1px solid var(--accent-cyan);
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        padding: 8px 16px;
        border-radius: 6px;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 0.8rem;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 2500);
  }

  bindEvents() {
    const searchInput = document.getElementById('searchField');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderArticles();
      });
    }

    const mobileSearch = document.getElementById('mobileSearchField');
    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderArticles();
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderArticles();
      });
    }

    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category');
        this.setCategory(cat);
      });
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-cat');
        if (cat) {
          this.setCategory(cat);
          window.scrollTo({ top: document.getElementById('mainArticlesSection').offsetTop - 60, behavior: 'smooth' });
        }
      });
    });

    const newsForm = document.getElementById('newsletterForm');
    if (newsForm) {
      newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('newsletterEmail');
        if (input.value) {
          this.showToast(`⚡ Subscribed ${input.value} to Synapse Quantum Wire!`);
          input.value = '';
        }
      });
    }
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new BlogApp();
});
