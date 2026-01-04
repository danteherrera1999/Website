// Main Screen Ideas:
// Two modes:
//     List:
//         line all posts in column
//         Allow search feature by: Tags, title, date, media
//     Stem and Leaf:
//         Posts alternate sides of screen and are connected by date

// Both have posts become transparent as they scroll off the screen using global positioning math
// Posts have time and tags listed under them     
// Posts are intially loaded from '<postid>.json' files where the metadata is stored and then used to create the timeline
// URL arguments can be used to point to specific post in the timeline
// Function is used to point to specific posts in timeline view
// Filter function can preserve timeline view and only include relevant posts (tags, date Range, title keyword etc)
// Next post button

const postsFolder = 'https://api.github.com/repos/danteherrera1999/Website/contents/blog/posts';
const assetsFolder = "../assets/blog/"
async function get_all_posts() {
    const allPostData = {};

    const postsResponse = await fetch(postsFolder);
    const posts = await postsResponse.json();

    await Promise.all(
        posts.map(async post => {
            const res = await fetch(`${postsFolder}/${post.name}`);
            const postData = await res.json();
            allPostData[post.name.slice(0, -5)] =
                JSON.parse(atob(postData.content));
        })
    );

    return allPostData;
}

function applyFloatAndWidth(el, block) {
    const f = (block.float || "none").toLowerCase();
    el.classList.add(f === "left" ? "float-left" : f === "right" ? "float-right" : "float-none");

    if (block.width) el.style.width = block.width; // e.g. "320px" or "min(720px, 100%)"
}

function renderBlock(block) {
    const wrap = document.createElement("div");
    wrap.classList.add("post-block");

    if (block.type === "p") {
        const p = document.createElement("div");
        p.classList.add("post-p");
        p.textContent = block.text ?? "";
        wrap.appendChild(p);
        return wrap;
    }

    if (block.type === "image") {
        const m = document.createElement("div");
        m.classList.add("media-block");
        applyFloatAndWidth(m, block);

        const img = document.createElement("img");
        img.src = assetsFolder + block.src;
        img.alt = block.alt ?? "";
        m.appendChild(img);

        if (block.caption) {
            const cap = document.createElement("div");
            cap.classList.add("caption");
            cap.textContent = block.caption;
            m.appendChild(cap);
        }

        wrap.appendChild(m);
        return wrap;
    }

    if (block.type === "audio") {
        const m = document.createElement("div");
        m.classList.add("media-block");
        applyFloatAndWidth(m, block);

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = assetsFolder + block.src;
        m.appendChild(audio);

        if (block.caption) {
            const cap = document.createElement("div");
            cap.classList.add("caption");
            cap.textContent = block.caption;
            m.appendChild(cap);
        }

        wrap.appendChild(m);
        return wrap;
    }

    if (block.type === "video") {
        const m = document.createElement("div");
        m.classList.add("media-block");
        applyFloatAndWidth(m, block);

        const v = document.createElement("video");
        v.controls = true;
        v.src = assetsFolder + block.src;
        if (block.poster) v.poster = block.poster;
        m.appendChild(v);

        if (block.caption) {
            const cap = document.createElement("div");
            cap.classList.add("caption");
            cap.textContent = block.caption;
            m.appendChild(cap);
        }

        wrap.appendChild(m);
        // add a clearfix after big videos so next content doesn't wrap weirdly
        const c = document.createElement("div");
        c.classList.add("clearfix");
        wrap.appendChild(c);
        return wrap;
    }

    if (block.type === "link") {
        const m = document.createElement("a");
        m.classList.add("media-block");
        m.href = block.url;
        m.target = "_blank";
        m.rel = "noopener noreferrer";
        applyFloatAndWidth(m, block);

        // simple “card”
        const row = document.createElement("div");
        row.style.display = "grid";
        row.style.gridTemplateColumns = block.image ? "84px 1fr" : "1fr";
        row.style.gap = "12px";
        row.style.alignItems = "center";

        if (block.image) {
            const img = document.createElement("img");
            img.src = block.image;
            img.alt = "";
            img.style.width = "84px";
            img.style.height = "84px";
            img.style.objectFit = "cover";
            row.appendChild(img);
        }

        const col = document.createElement("div");
        const t = document.createElement("div");
        t.textContent = block.title ?? block.url;
        t.style.fontWeight = "600";

        const d = document.createElement("div");
        d.textContent = block.description ?? "";
        d.style.opacity = "0.85";
        d.style.fontSize = "0.85em";

        const u = document.createElement("div");
        u.textContent = new URL(block.url).hostname;
        u.style.opacity = "0.7";
        u.style.fontSize = "0.8em";

        col.appendChild(t);
        if (block.description) col.appendChild(d);
        col.appendChild(u);
        row.appendChild(col);

        m.appendChild(row);
        wrap.appendChild(m);
        return wrap;
    }

    // fallback for unknown block types
    const unk = document.createElement("div");
    unk.textContent = `[Unknown block type: ${block.type}]`;
    unk.style.opacity = "0.7";
    wrap.appendChild(unk);
    return wrap;
}

function renderPostContent(postData) {
    const container = document.getElementById("post-content");
    container.innerHTML = "";

    // Backward compatibility: old posts only have "text"
    const blocks = Array.isArray(postData.content)
        ? postData.content
        : [{ type: "p", text: postData.text ?? "" }];

    blocks.forEach(b => container.appendChild(renderBlock(b)));

    // final clearfix to end any floats
    const c = document.createElement("div");
    c.classList.add("clearfix");
    container.appendChild(c);
}

async function init_page() {

    // Get post ID from URL Params
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('pid');

    // Load Post Data
    const allPostData = await get_all_posts();
    Object.entries(allPostData).forEach((postData) => { allPostData[postData[0]].post_id = postData[0] })
    let allPostsDataList = Object.entries(allPostData).map((postData) => postData[1]);

    // Sort by timestamp
    allPostsDataList.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    })

    const postData = allPostData[pid];
    const orderedPids = allPostsDataList.map((postData) => postData.post_id)
    const nPost = orderedPids.indexOf(String(pid));

    // Fill post data
    let title = document.getElementById('post-title');
    title.innerHTML = postData.title;
    let date = document.getElementById('post-date');
    date.innerHTML = this.date = new Date(`${postData.date}T${postData.time}`).toLocaleString();

    // Generate tag elements:
    let tagBox = document.getElementById('tag-box');
    postData.tags.forEach((tag) => {
        let newTag = document.createElement('p');
        newTag.classList.add('tag');
        newTag.innerHTML = tag;
        tagBox.appendChild(newTag)
    })
    let text = document.getElementById('post-text');
    // text.innerHTML = postData.text;
    renderPostContent(postData);

    // Set up footer buttons
    document.getElementById('prev-button-text').innerHTML = nPost == 0 ? "Blog Home" : "Previous Post";
    document.getElementById('prev-button').href = nPost == 0 ? "./blog_main.html" : `./post_main.html?pid=${orderedPids[nPost - 1]}`;
    document.getElementById('next-button-text').innerHTML = (nPost == orderedPids.length - 1) ? "Blog Home" : "Next Post";
    document.getElementById('next-button').href = (nPost == orderedPids.length - 1) ? "./blog_main.html" : `./post_main.html?pid=${orderedPids[nPost + 1]}`;

}

init_page()
