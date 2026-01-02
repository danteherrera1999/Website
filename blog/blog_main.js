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
let postBox = null;
const postsReady = new Promise(r => (postsReadyResolve = r));

class Post {
    constructor(post_id, postData) {
        this.post_id = post_id;
        this.title = postData.title;
        this.date = new Date(`${postData.date}T${postData.time}`)
        this.tags = postData.tags;
        this.init_element();
    }
    init_element(){
        this.element = document.createElement('div');
        this.element.classList.add('post');
        let titleElement = document.createElement('a');
        titleElement.innerHTML = this.title;
        titleElement.addEventListener('click',()=>this.handleClick());
        this.element.appendChild(titleElement);
        let dateElement = document.createElement('p');
        dateElement.innerHTML = this.date.toLocaleString();
        this.element.appendChild(dateElement);
        this.element.appendChild(this.generateTagBox())
        this.container = this.generateContainer();
    }
    generateTagBox(){
        let tagBoxElement = document.createElement('div');
        tagBoxElement.classList.add('tagBox');
        this.tags.forEach((tag)=>{
            let newTagElement = document.createElement('p');
            newTagElement.classList.add('tag');
            newTagElement.innerHTML = tag;
            tagBoxElement.appendChild(newTagElement);
        })
        return tagBoxElement;
    }
    generateContainer(){
        let newContainer = document.createElement('div');
        let leftPad = document.createElement('div');
        let rightPad = document.createElement('div');
        leftPad.classList.add('leftPad');
        rightPad.classList.add('rightPad');
        newContainer.appendChild(leftPad);
        newContainer.appendChild(this.element);
        newContainer.appendChild(rightPad);
        newContainer.classList.add('postContainer');
        return newContainer;
    }
    handleClick(){
        window.location.href=`./post_main.html?pid=${this.post_id}`;
    }
}

class PostBox{
    constructor(allPosts){
        this.posts = allPosts;
        this.element = document.getElementById('post-box');
        this.generateTimeline();
        this.activePosts = this.posts;
        this.updateActivePosts();
        
    }
    generateTimeline(){
        this.posts.forEach((post)=>{
            this.element.appendChild(post.container);
        })
        this.centerLine = document.createElement('div');
        this.centerLine.classList.add('center-line');
        this.element.appendChild(this.centerLine);
    }
    updateActivePosts(){
        this.posts.forEach((post)=>post.container.classList.add('hidden'));
        this.activePosts.forEach((post)=>post.container.classList.remove('hidden'));
        let nPosts = this.activePosts.length;
        for (let i = 0; i<nPosts;i++){
            let element = this.activePosts[i].container;
            let left = i%2==0;
            element.classList.add(left? 'leftPost':'rightPost');
        }
        this.centerLine.style.height = `calc(${6*(nPosts-1)}em + 3px)`;
    }
}
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
    
    // Load Post Data
    const allPostData = await get_all_posts();
    let allPosts = Object.entries(allPostData).map((postData) => new Post(postData[0], postData[1]));

    // Sort by timestamp
    allPosts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    })

    // Create postBox
    postBox = new PostBox(allPosts);
    console.log(postBox)
}

init_page()
