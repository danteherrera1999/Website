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
    const orderedPids = allPostsDataList.map((postData)=>postData.post_id)
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
    text.innerHTML = postData.text;

    // Set up footer buttons
    document.getElementById('prev-button-text').innerHTML = nPost==0? "Blog Home" : "Previous Post";
    document.getElementById('prev-button').href = nPost==0? "./blog_main.html" :`./post_main.html?pid=${orderedPids[nPost-1]}`;
    document.getElementById('next-button-text').innerHTML = (nPost==orderedPids.length-1)? "Blog Home" : "Next Post";
    document.getElementById('next-button').href = (nPost==orderedPids.length-1)? "./blog_main.html" :`./post_main.html?pid=${orderedPids[nPost+1]}`;

}

init_page()
