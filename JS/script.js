const fileInput = document.getElementById("fileInput");
const treeContainer = document.getElementById("tree");
const attributesPanel = document.getElementById("attributes");
const errorMsg = document.getElementById("errorMsg");

const elementInput = document.getElementById('elements-block')
elementInput.value = `<section id="main-section" class="container" data-section="intro" aria-label="Main Section">
  <article class="post" data-id="1" lang="en" draggable="true">
    <header class="post-header" role="banner">
      <h1 class="title" style="color: darkblue;" tabindex="0" title="Click to read">Understanding HTML Nesting</h1>
    </header>
    <div class="post-content" contenteditable="false" hidden="false" spellcheck="true">
      <p class="description" id="para1" data-text="intro" dir="ltr">
        This is a simple paragraph describing the topic.
      </p>
      <div class="additional-info" style="padding-left: 10px;" aria-hidden="false">
        <ul class="info-list" id="infoList" type="disc">
          <li class="info-item" title="Nested Item" data-level="5" aria-level="5">
            Level 5: Deeply nested list item
          </li>
        </ul>
      </div>
    </div>
  </article>
</section>`
if (elementInput.value) {
    extractTextAndBuild(elementInput.value)
}
elementInput.addEventListener('input', () => {
    if (elementInput.value) {
        extractTextAndBuild(elementInput.value)
    }
});

function extractTextAndBuild(text) {
    try {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = text.trim();

        if (!wrapper.firstElementChild) {
            throw new Error("Không tìm thấy phần tử HTML hợp lệ.");
        }

        errorMsg.textContent = "";
        treeContainer.innerHTML = "";
        attributesPanel.innerHTML = "Choose an element to view attributes";

        buildTree(wrapper, treeContainer);
    } catch (err) {
        errorMsg.textContent = "Lỗi: Nội dung file không phải mã HTML hợp lệ.";
    }
}

if (fileInput.value) {
    elementInput.setAttribute('disabled', true)
}

fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".txt")) {
        errorMsg.textContent = "Chỉ chấp nhận file .txt";
        return;
    }

    const text = await file.text();
    extractTextAndBuild(text)
});


function buildTree(element, container) {
    Array.from(element.children).forEach((child) => {
        const node = document.createElement("div");
        node.className = "tree-node";

        const hasChildren = child.children.length > 0;

        if (hasChildren) {
            const toggle = document.createElement("span");
            toggle.className = "tree-toggle";
            toggle.textContent = "+";
            toggle.onclick = () => {
                node.classList.toggle("active");
                toggle.textContent = node.classList.contains("active") ? "−" : "+";
            };
            node.appendChild(toggle);
        } else {
            const spacer = document.createElement("span");
            spacer.style.display = "inline-block";
            spacer.style.width = "14px";
            node.appendChild(spacer);
        }

        const label = document.createElement("span");
        label.className = "node-label";
        label.textContent = `<${child.tagName.toLowerCase()}>`;
        label.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
            label.classList.add("highlight");
            showAttributes(child);
        };
        node.appendChild(label);

        if (hasChildren) {
            const subTree = document.createElement("div");
            subTree.className = "collapsible";
            buildTree(child, subTree);
            node.appendChild(subTree);
        }

        container.appendChild(node);
    });
}

function showAttributes(el) {
    const attrs = Array.from(el.attributes)
        .filter(attr => attr.name !== "style")
        .map(attr => `
      <li style='cursor: pointer;' class="attribute-item">
        <span><span style='color: #9cdcfe'>${attr.name}</span>: <span style='color: #ce9178'>"${attr.value}"</span></span>
        <button class="copy-btn" title="Copy value" data-value="${attr.value}">
          <img width='20' src='./IMAGES/copy.jpg' />
        </button>
      </li>
    `)
        .join("");

    attributesPanel.innerHTML = `
    <h3><span style='color: yellow'>&lt;${el.tagName.toLowerCase()}&gt;</span> attributes</h3>
    ${attrs ? `<ul>${attrs}</ul>` : "<p>Không có thuộc tính nào.</p>"}
  `;

    // Gắn sự kiện copy
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = `"` + btn.getAttribute('data-value') + `"`;
            btn.innerHTML = `<img width='20' src='./IMAGES/copied.jpg' />`

            navigator.clipboard.writeText(value).then(() => {
                setTimeout(() => {
                    btn.innerHTML = `<img width='20' src='./IMAGES/copy.jpg' />`

                }, 1000)
            });
        });
    });

    window.selectedElement = el;
}


// Modal logic
const modal = document.getElementById("xpathModal");
const closeModalBtn = document.getElementById("closeModal");
const xpathList = document.getElementById("xpathList");

closeModalBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};
