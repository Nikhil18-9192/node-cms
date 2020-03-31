const express = require('express');
const router = express.Router();
const post = require('../../modules/Post');
const comment = require('../../modules/comment');


router.all('/*',  (req, res, next)=>{

    req.app.locals.layout = 'admin';
    next();


});



router.get('/', (req, res)=>{


    comment.find({user: req.user.id}).populate('user')
    .then(comments=>{

        res.render('admin/comments', {comments: comments});


    });

   

});

router.post('/', (req, res)=>{

    post.findOne({_id: req.body.id}).then(post=>{

       // console.log(post);

         const newComment = new comment({

            user: req.user.id,
            body: req.body.body

        });

            post.comments.push(newComment);

            post.save().then(savedPost=>{

                newComment.save().then(savedComment=>{

                    req.flash('success_message', `YOUR comment will be reviewd after approved comment by admin`);
                    res.redirect(`/post/${post.id}`);
                });
            });
    });

router.delete('/:id', (req, res)=>{

     comment.remove({_id: req.params.id}).then(deleteItem=>{

         post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{

            if(err) console.log(err);
             res.redirect('/admin/comments');
        }); 
      
        

     });

});
   

});


router.post('/approve-comment', (req, res)=>{

  comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{

    if(err) return err;

    res.send(result);

  });

});




module.exports = router;