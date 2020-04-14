var mongoose = require('mongoose')
var Campground = require('./models/campground')
var Comment = require('./models/comment')

var data = [
    {
        name: "mountain view",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    },
    {
        name: "lake view",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
    }
]

function seedDb(){
    Campground.remove({}, function(err){
        if(err){
            console.log(err)
        }
        console.log("removed campground")

        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err)
                }
                else {
                    console.log('campground added')
                    //create a comment 
                    Comment.create(
                        {
                            text: "this place is great, but wish it had internet",
                            author: "bummer"
                        }, function(err, comment) {
                            if(err){
                                console.log(err)
                            } else {
                                campground.comments.push(comment)
                                campground.save()
                                console.log('crated new comment')
                            }
                        }
                    )
                }
            })
        })
    })
}

module.exports = seedDb;