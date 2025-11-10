

const category_buttons = [...document.getElementById('project-categories-ribbon').children]
const project_icons = [...document.getElementById("projects-bar").children]
category_buttons.forEach((categoryButton)=>{
    categoryButton.children[0].addEventListener('click',(e)=>handleCategoryChange(e.target.value))
})


function handleCategoryChange(category){
    project_icons.forEach((projectIcon)=>{
        if ([...projectIcon.classList].includes(category)){
            projectIcon.classList.remove('hidden')
        }
        else{
            projectIcon.classList.add('hidden')
        }
    })
    localStorage['projectTab'] = category;
}

if (localStorage['projectTab']==undefined){
    handleCategoryChange('quantum-mechanics')
}
else{
    handleCategoryChange(localStorage['projectTab'])
}