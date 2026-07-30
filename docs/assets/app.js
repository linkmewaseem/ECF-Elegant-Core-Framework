// ECF Documentation SPA Controller

document.addEventListener("DOMContentLoaded", () => {
  const docs = window.ECF_DOCS || [];
  let currentDocId = "installation";

  // Elements
  const sidebarNav = document.getElementById("sidebar-nav");
  const contentArea = document.getElementById("doc-content");
  const tocList = document.getElementById("toc-list");
  const prevNavCard = document.getElementById("prev-nav-card");
  const nextNavCard = document.getElementById("next-nav-card");

  const searchTrigger = document.getElementById("search-trigger");
  const searchModal = document.getElementById("search-modal");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const themeToggle = document.getElementById("theme-toggle");

  // 1. Initialize Theme
  const savedTheme = localStorage.getItem("ecf-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ecf-theme", newTheme);
  });

  // 2. Render Sidebar
  function renderSidebar() {
    if (!sidebarNav) return;

    // Group docs by category
    const categories = {};
    docs.forEach(doc => {
      if (!categories[doc.category]) {
        categories[doc.category] = [];
      }
      categories[doc.category].push(doc);
    });

    let html = "";
    Object.keys(categories).forEach(catName => {
      html += `
        <div class="nav-group">
          <div class="nav-group-title">${catName}</div>
          <ul class="nav-list">
      `;
      categories[catName].forEach(item => {
        const isActive = item.id === currentDocId ? "active" : "";
        html += `
          <li>
            <a class="nav-item ${isActive}" data-id="${item.id}">
              <span>${item.icon || '📄'}</span>
              <span>${item.title}</span>
            </a>
          </li>
        `;
      });
      html += `
          </ul>
        </div>
      `;
    });

    sidebarNav.innerHTML = html;

    // Attach click handlers
    sidebarNav.querySelectorAll(".nav-item").forEach(el => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const docId = el.getAttribute("data-id");
        if (docId) loadDoc(docId);
      });
    });
  }

  // 3. Simple Markdown Parser
  function parseMarkdown(md) {
    if (!md) return "";

    let lines = md.split("\n");
    let html = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer = [];
    let inTable = false;
    let tableBuffer = [];

    lines.forEach(line => {
      // Code Blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // Close code block
          const codeContent = escapeHtml(codeBuffer.join("\n"));
          html.push(`
            <div class="code-block-wrapper">
              <div class="code-block-header">
                <span>${codeLanguage || 'code'}</span>
                <button class="copy-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy
                </button>
              </div>
              <pre><code>${codeContent}</code></pre>
            </div>
          `);
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace("```", "") || "code";
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableBuffer = [];
        }
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        html.push(renderTable(tableBuffer));
        inTable = false;
        tableBuffer = [];
      }

      // Alerts / Callouts
      if (line.trim().startsWith("> [!")) {
        const match = line.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
        if (match) {
          const type = match[1].toLowerCase();
          html.push(`<div class="alert-box ${type}"><div class="alert-title">${type}</div>`);
          return;
        }
      } else if (line.trim().startsWith("> ")) {
        const alertText = formatInline(line.trim().replace(/^>\s*/, ""));
        html.push(`<div>${alertText}</div></div>`);
        return;
      }

      // Headings
      if (line.startsWith("# ")) {
        const text = formatInline(line.replace("# ", ""));
        html.push(`<h1>${text}</h1>`);
      } else if (line.startsWith("## ")) {
        const text = formatInline(line.replace("## ", ""));
        const id = text.toLowerCase().replace(/[^\w]+/g, "-");
        html.push(`<h2 id="${id}">${text}</h2>`);
      } else if (line.startsWith("### ")) {
        const text = formatInline(line.replace("### ", ""));
        const id = text.toLowerCase().replace(/[^\w]+/g, "-");
        html.push(`<h3 id="${id}">${text}</h3>`);
      } else if (line.trim() === "") {
        // empty line
      } else {
        html.push(`<p>${formatInline(line)}</p>`);
      }
    });

    if (inTable && tableBuffer.length > 0) {
      html.push(renderTable(tableBuffer));
    }

    return html.join("\n");
  }

  function formatInline(str) {
    if (!str) return "";
    return str
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderTable(rows) {
    if (rows.length < 2) return "";
    let html = '<div class="table-wrapper"><table><thead>';
    const headerCols = rows[0].split("|").filter(c => c.trim() !== "");
    html += '<tr>' + headerCols.map(c => `<th>${formatInline(c.trim())}</th>`).join('') + '</tr></thead><tbody>';

    for (let i = 2; i < rows.length; i++) {
      const cols = rows[i].split("|").filter(c => c.trim() !== "");
      if (cols.length > 0) {
        html += '<tr>' + cols.map(c => `<td>${formatInline(c.trim())}</td>`).join('') + '</tr>';
      }
    }
    html += '</tbody></table></div>';
    return html;
  }

  // 4. Load Document
  function loadDoc(docId) {
    const doc = docs.find(d => d.id === docId) || docs[0];
    currentDocId = doc.id;

    // Render markdown content
    contentArea.innerHTML = parseMarkdown(doc.content);

    // Update active nav class
    renderSidebar();

    // Scroll top
    window.scrollTo(0, 0);

    // Render TOC
    renderTOC();

    // Attach copy button handlers
    contentArea.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.closest(".code-block-wrapper").querySelector("code").innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = `<span>✓</span> Copied!`;
          setTimeout(() => {
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
          }, 2000);
        });
      });
    });

    // Pagination Footer
    const index = docs.findIndex(d => d.id === doc.id);
    if (index > 0) {
      const prev = docs[index - 1];
      prevNavCard.style.display = "flex";
      prevNavCard.querySelector(".nav-card-title").innerText = prev.title;
      prevNavCard.onclick = () => loadDoc(prev.id);
    } else {
      prevNavCard.style.display = "none";
    }

    if (index < docs.length - 1) {
      const next = docs[index + 1];
      nextNavCard.style.display = "flex";
      nextNavCard.querySelector(".nav-card-title").innerText = next.title;
      nextNavCard.onclick = () => loadDoc(next.id);
    } else {
      nextNavCard.style.display = "none";
    }
  }

  // 5. Render Table of Contents
  function renderTOC() {
    if (!tocList) return;
    const headings = contentArea.querySelectorAll("h2, h3");
    if (headings.length === 0) {
      tocList.innerHTML = '<li class="toc-link">No section headings</li>';
      return;
    }

    let html = "";
    headings.forEach(h => {
      const id = h.id || h.innerText.toLowerCase().replace(/[^\w]+/g, "-");
      h.id = id;
      html += `<li><a href="#${id}" class="toc-link">${h.innerText}</a></li>`;
    });
    tocList.innerHTML = html;
  }

  // 6. Search Modal Logic
  searchTrigger?.addEventListener("click", () => {
    searchModal.classList.add("active");
    searchInput.focus();
  });

  searchModal?.addEventListener("click", (e) => {
    if (e.target === searchModal) searchModal.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchModal.classList.add("active");
      searchInput.focus();
    }
    if (e.key === "Escape") {
      searchModal.classList.remove("active");
    }
  });

  searchInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResults.innerHTML = "";
      return;
    }

    const matches = docs.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      d.content.toLowerCase().includes(query)
    );

    let html = "";
    matches.forEach(m => {
      html += `
        <li class="search-result-item" data-id="${m.id}">
          <div class="search-result-title">${m.category} / ${m.title}</div>
          <div class="search-result-snippet">${m.content.slice(0, 100).replace(/[#*`]/g, '')}...</div>
        </li>
      `;
    });

    searchResults.innerHTML = html || '<li class="search-result-item">No results found</li>';

    searchResults.querySelectorAll(".search-result-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id");
        if (id) {
          loadDoc(id);
          searchModal.classList.remove("active");
        }
      });
    });
  });

  // Initial Boot
  renderSidebar();
  loadDoc("installation");
});
