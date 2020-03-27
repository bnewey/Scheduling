import React, { useEffect } from 'react';

import {makeStyles, Modal, Backdrop, Fade, Grid} from '@material-ui/core';





const SingleImageModal = (props) => {

    const {imageSrc, imageTitle, thumbDivStyle, thumbImgStyle } = props;
    const classes = useStyles();
    

     //Single Image Modal State
     const [imageModalOpen, setImageModalOpen] = React.useState(false);
 
     //Single Image Modal Function
     const handleImageModalOpen = () => {
         setImageModalOpen(!imageModalOpen);
     }
 
     const handleImageModalClose = () => {
         setImageModalOpen(false);
     };    
    
    return(
        <>
        <div className={thumbDivStyle ? thumbDivStyle : classes.img_div}>
             <img src={imageSrc} className={thumbImgStyle ? thumbImgStyle : classes.img} alt={imageTitle} onClick={ handleImageModalOpen}/>
        </div>
        {imageModalOpen ? 
        <Modal aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={imageModalOpen}
            onClose={handleImageModalClose}
            onClick={handleImageModalClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
             }}>
            <Fade in={imageModalOpen}>
                <div className={classes.container}>
                <Grid container >  
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                           {imageTitle} - Image
                        </span>
                    </div>
                    <Grid item xs={12} classes={{root: classes.paper}} >
                        {imageSrc ? 
                        <>
                            <div className={classes.img_div}>
                                <img src={imageSrc} className={classes.img} alt={imageTitle}/>
                            </div>
                        </>
                        :  <><h2>No Image Source Provided</h2></>}
                    </Grid>
                   
                </Grid>
                </div>
            </Fade>
        </Modal>
        : <></>}

        </>
    );
};

export default SingleImageModal;


const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
        cursor: 'pointer',
    },
    paper: {
        backgroundColor: '#333',
        boxShadow: theme.shadows[5],
        padding: '2% 3% 3% 3% !important',
        position: 'relative',
        width: '100%'
    },
    container: {
        width: '70%',
        maxWidth:'70% !important',
        textAlign: 'center',
    },
    modalTitleDiv:{
        backgroundColor: '#5b7087',
        padding: '5px 0px 5px 0px',
        width: '100%',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#fff',
    },
    img_div:{
        width: '100%',
        padding: '7%',
        cursor: 'pointer',
    },
    img:{
        width: '100%',
        boxShadow: '0px 15px 16px 5px rgba(0,0,0,0.42)',
        border: '1px solid #9a9a9a',
    },
 
    
  }));

