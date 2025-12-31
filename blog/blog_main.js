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

const postsFolder = './posts'



class Post {
    constructor(post_data) {
        this.title = post_data.title;

    }
}


function get_all_posts() {
    // Load all templates
    fetch(postsFolder).then(response => response.json()).then((posts) => {
        posts.forEach(post => {
            console.log(post)
        })
    });
}

get_all_posts();