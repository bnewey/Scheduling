import React, {useRef, useState, useEffect, useContext} from 'react';
import { Modal, Backdrop, Fade, Button, ButtonGroup, Grid, makeStyles } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';

import cogoToast from 'cogo-toast';
import FormBuilder from '../../UI/FormComponents/FormBuilder';
import Settings from '../../../js/Settings';
import { AdminContext } from '../AdminContainer';

const AddUserForm = (props) => {

    const {open, onClose, editModalMode} = props;

    const [newUser, setNewUser] = React.useState(null);

    //const [newUser, setNewUser] = useState({
    //    first_name: '',
    //    last_name: '',
    //  });

    const classes = useStyles();
    const saveRef = React.useRef(null);

    const {user} = useContext(AdminContext);
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);

    useEffect(()=>{
        if(open == false){
            setSaveButtonDisabled(false);
        }
    },[open])

    const handleDialogClose = () => {
        onClose();
        setSaveButtonDisabled(false);
    };

    //useEffect(()=>{
    //    if(editModalMode == "add"){
    //        setNewUser({});
    //    }
    //},[editModalMode])

    const handleSave = (internalUser, updateInternalUser, addOrEdit) => {
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject)=>{
            if(!updateInternalUser){
                console.error("Bad internal user")
                reject("Bad internal user");
            }

            

            Settings.addRaineyUser(updateInternalUser, user)
            .then( (data) => {
                cogoToast.success(`New Internal User has been added!`, {hideAfter: 4});
                resolve(data)
            })
            .catch( error => {
                console.warn(error);
                cogoToast.error(`Error adding internal user. ` , {hideAfter: 4});
                reject(error)
            })
            handleDialogClose();
    });
};

    const fields = [
        {field: 'first_name', label: 'First Name', type: 'text', updateBy: 'ref', multiline: false, required: true},
        {field: 'last_name', label: 'Last Name', type: 'text', updateBy: 'ref', multiline: false, required: true},
        // Add more fields as needed
    ];

    return(<>
        { open && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={open}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {'Add User'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            {/*FORM*/}
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editModalMode} 
                                classes={classes} 
                                formObject={newUser} 
                                setFormObject={setNewUser}
                                handleClose={onClose} 
                                handleSave={handleSave}
                                 />
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                    onClick={() => onClose()}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    Close
                                </Button></ButtonGroup>
                            <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                    disabled={saveButtonDisabled}
                                    onClick={ () => { saveRef.current.handleSaveParent() }}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    <SaveIcon />Save
                                </Button>
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </div>
            </Fade>
    </Modal>}
    </>) 
    }


export default AddUserForm;

const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1 !important',
        '&& div':{
            outline: 'none',
        },
    },
    paperScroll: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: '3% !important',
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '650px',

        background: 'linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%, radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .52), rgba(0, 0, 0, 0)) 0 100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 40px, 100% 40px, 100% 14px, 100% 14px',
        /* Opera doesn't support this in the shorthand */
        backgroundAttachment: 'local, local, scroll, scroll',
    },
    paper_footer: {
        backgroundColor: '#ececec',
        padding: '1% !important',
        display: 'flex',
        justifyContent:'flex-end',
    },
    container: {
        [theme.breakpoints.down('sm')]: {
            width: '94%',
        },
        [theme.breakpoints.up('md')]: {
            width: '70%',
        },
        minHeight: '50%',
        textAlign: 'center',
        
    },
    modalTitleDiv:{
        background: 'linear-gradient(0deg, #f1f1f1, white)',
        padding: '5px 0px 5px 0px',
        borderRadius: '6px 6px 0px 0px',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '300',
        color: '#444',
    },
    saveButton:{
        backgroundColor: '#414d5a'
    },

    buttonGroup: {
        marginLeft: '1%',
        '& .MuiButton-label':{
            color: '#fff',
        },
        '&:hover':{
            '& .MuiButton-label':{
                color: '#52c7ff',
                
            },
        }
    },
    text_button:{
        cursor: 'pointer',
        fontSize: '14px',
        color: '#fff',
        margin: '1% 2%',
        padding: '1%',
    },
    inputDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        minHeight: '25px',
    //   padding: '4px 0px 4px 0px',
        borderBottom: '1px solid #eee'
    },
    inputStyle:{
        padding: '5px 7px',
        width: '100%',
        
    },
    inputStyleDate:{
        padding: '5px 7px',
        width: '55%',
        
    },
    inputRoot: {
        padding: '5px 7px',
        width: '100%',
        '&& .MuiOutlinedInput-multiline': {
            padding: '0px'
        },
    },
    inputLabel:{
        flexBasis: '30%',
        textAlign: 'right',
        marginRight: '35px',
        fontSize: '15px',
        color: '#787878',
    },
    inputValue:{
        flexBasis: '70%',
        textAlign: 'left',
    },
    inputValueSelect:{
        flexBasis: '70%',
        textAlign: 'left',
        padding: '5px 7px',
    },
    inputFieldMatUi: {
        margin: '10px 17px 7px 17px',
        padding: '0px',
        '&& input':{
            padding: '12px 0px 12px 15px',
        },
        '&& .MuiSelect-select':{
            padding: '12px 40px 12px 15px',
            minWidth: '120px',
        },
        '&& .MuiOutlinedInput-multiline': {
            padding: '8.5px 12px'
        },
        '&& label':{
            backgroundColor: '#fff',
        },
        inputSelect:{
            width: '100%',
        },
    },
    errorSpan:{
        color: '#bb4444',
    },
    deleteButton:{
        backgroundColor: '#c4492e',
        '&:hover':{
            backgroundColor: '#f81010',
        }
    },
}));