const express = require("express");
const router  = express.Router();
const posts = require("./db.js");
const { update } = require("./db.js");

router.post("/", (req,res)=>{
    const postInfo = req.body;

    if(postInfo.title && postInfo.contents) {
        posts.insert(postInfo)
        .then(newPost =>{
            console.log("this is the new post id", newPost)
            posts.findById(newPost.id)
            .then(post => {
                console.log("this is the new post", post)
                res.status(201).json(post);
            })
        })
        .catch(err => {
            res.status(500).json({ error: "There was an error while saving the post to the database" })
        })
    } else {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    }
})

router.post("/:id/comments", (req,res) => {
    const commentInfo = {...req.body, post_id: req.params.id}
    posts.findById(commentInfo.post_id)
    .then(post => {
        if(post.length > 0) {
            console.log("Post was found",post)
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }
    })

    if (commentInfo.text) {
        posts.insertComment(commentInfo)
        .then(newComment => {
            posts.findCommentById(newComment.id)
            .then(comment => {
                res.status(201).json(comment);
            })
            
        })
        .catch(error =>{
            res.status(500).json({ error: "There was an error while saving the comment to the database" });
        })
    } else {
        res.status(400).json({ errorMessage: "Please provide text for the comment." })
    }
})

router.get("/", (req,res)=>{
    posts.find(req.query)
    .then(allPosts => {
        res.status(200).json(allPosts);
    })
    .catch(error => {
        res.status(500).json({ error: "The posts information could not be retrieved." })
    });
})

router.get("/:id", (req,res) => {

    posts.findById(req.params.id)
    .then(post => {
        if(post.length > 0) {
            console.log("Post was found",post)
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
            console.log("this is the post", post)
        }
    })
    .catch(error => {
        res.status(500).json({ error: "The post information could not be retrieved." })
    })
})

router.get("/:id/comments", (req,res)=>{
    posts.findById(req.params.id)
    .then(post => {
        if(post.length > 0) {
            console.log("Post was found",post)
            posts.findPostComments(post[0].id)
            .then(comments => {
                res.status(200).json(comments);
            })
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
            console.log("this is the post", post)
        }
    })
    .catch(error => {
        res.status(500).json({ error: "The comments information could not be retrieved." })
    })
})

router.delete("/:id", (req,res) =>{
    posts.findById(req.params.id)
    .then(post => {
        if(post.length > 0) {
            console.log("Post was found",post)
            posts.remove(req.params.id)
            .then(deleted => {
                res.status(200).json(deleted)
            })
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }
    })
    .catch(error => {
        res.status(500).json({ error: "The post could not be removed" })
    })
})

router.put("/:id", (req,res) => {
    const updateInfo = req.body;
    posts.findById(req.params.id)
    .then(post => {
        if(post.length > 0) {
            console.log("Post was found",post)
            if(updateInfo.title && updateInfo.contents) {
                posts.update(req.params.id, updateInfo)
                .then(updated => {
                    posts.findById(req.params.id)
                    .then(updatedPost => {
                        res.status(200).json(updatedPost);
                    })
                })
            } else {
                res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
            }
        } else {
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }
    })
    .catch(error => {
        res.status(500).json({ error: "The post information could not be modified." });
    })
})

module.exports = router;