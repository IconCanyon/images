(function () {

const DATA = {};

window.CodeMagic = {
    save(obj) {
        Object.assign(DATA, obj);
        document.querySelectorAll("code-magic").forEach(el => {
            if (el.renderCodeMagic) el.renderCodeMagic();
        });
    }
};

class CodeMagic extends HTMLElement {

    connectedCallback() {
        this.renderCodeMagic = () => this.render();
        this.render();
    }

    async render() {

        const id = this.getAttribute("com");
        const item = DATA[id];

        if (!item) {
            this.innerHTML = "لا توجد بيانات";
            return;
        }

        const [htmlCode, cssCode, jsCode] = await Promise.all([
            item.html ? fetch(item.html).then(r => r.text()).catch(() => "") : "",
            item.css ? fetch(item.css).then(r => r.text()).catch(() => "") : "",
            item.js ? fetch(item.js).then(r => r.text()).catch(() => "") : ""
        ]);

        // تحديد اللغات الموجودة فعلياً
        const codes = {
            html: htmlCode,
            css: cssCode,
            js: jsCode
        };

        const available = Object.keys(codes).filter(k => codes[k] !== "");

        this.innerHTML = `
        <div class="cm-wrapper">

            <div class="cm-tabs"></div>

            <div class="cm-body">

                <div class="cm-code"></div>

                <div class="cm-preview">
                    <iframe></iframe>
                </div>

            </div>

        </div>
        `;

        const tabsContainer = this.querySelector(".cm-tabs");
        const codeBox = this.querySelector(".cm-code");
        const iframe = this.querySelector("iframe");

        // إنشاء الأزرار تلقائياً
        available.forEach((lang, index) => {

            const btn = document.createElement("button");
            btn.className = "cm-tab" + (index === 0 ? " active" : "");
            btn.textContent = lang.toUpperCase();
            btn.dataset.lang = lang;

            tabsContainer.appendChild(btn);

            btn.onclick = () => {

                this.querySelectorAll(".cm-tab")
                    .forEach(x => x.classList.remove("active"));

                btn.classList.add("active");

                codeBox.textContent = codes[lang];
            };
        });

        // عرض أول لغة تلقائياً
        const first = available[0];

        codeBox.textContent = codes[first] || "";

        const finalCode = `
<!DOCTYPE html>
<html>
<head>
<style>${cssCode}</style>
</head>
<body>

${htmlCode}

<script>
${jsCode}
<\/script>

</body>
</html>
`;

        iframe.srcdoc = finalCode;

    }

}

customElements.define("code-magic", CodeMagic);

// CSS
const style = document.createElement("style");

style.textContent = `
code-magic{
display:block;
margin:20px 0;
}

.cm-wrapper{
border:1px solid #ddd;
border-radius:12px;
overflow:hidden;
font-family:Arial;
}

.cm-tabs{
display:flex;
background:#f5f5f5;
border-bottom:1px solid #ddd;
}

.cm-tab{
border:none;
padding:10px 15px;
cursor:pointer;
background:none;
}

.cm-tab.active{
background:#fff;
font-weight:bold;
}

.cm-body{
display:flex;
height:500px;
}

.cm-code{
width:50%;
padding:15px;
overflow:auto;
white-space:pre-wrap;
background:#fafafa;
border-left:1px solid #ddd;
font-family:monospace;
}

.cm-preview{
width:50%;
}

.cm-preview iframe{
width:100%;
height:100%;
border:none;
}
`;

document.head.appendChild(style);

})();