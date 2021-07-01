import React, {useRef, useState, useEffect, useContext, useCallback} from 'react';
import {makeStyles, withStyles,Modal, Backdrop, Fade, Grid,ButtonGroup, Button,TextField, InputBase, Select, MenuItem,
     Checkbox,IconButton} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AccountBoxIcon from '@material-ui/icons/AccountBox';

import moment from 'moment';
import cogoToast from 'cogo-toast';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from '../../../UI/ConfirmYesNo';

import DateFnsUtils from '@date-io/date-fns';
import {
    DatePicker,
    KeyboardDatePicker,
    TimePicker,
    MuiPickersUtilsProvider,
  } from '@material-ui/pickers';

import Util from '../../../../js/Util.js';

import Settings from  '../../../../js/Settings';
import Inventory from  '../../../../js/Inventory';
import { ListContext } from '../InvPartsContainer';

import FormBuilder from '../../../UI/FormComponents/FormBuilder';
import AddEditPartTypeDialog  from '../../Inv_Admin/MainPanels/components/AddEditPartTypeDialog.js';
import _ from 'lodash';


const AddEditModal = function(props) {
    const {user} = props;

    const { parts, setParts, setPartsRefetch,currentView, setCurrentView, views,columnState, setColumnState, detailPartId,
        setDetailPartId,editPartModalMode,setEditPartModalMode, activePart, setActivePart, editPartModalOpen,setEditPartModalOpen,
         recentParts, setRecentParts} = useContext(ListContext);

    const saveRef = React.createRef();
    const [partTypes, setPartTypes] = useState(null);
    const classes = useStyles();

    const [addNewPartTypeDialog,setAddNewPartTypeDialog] = useState(false);

    const handleCloseModal = () => {
        setActivePart(null);
        setEditPartModalOpen(false);
    };

    const handleOpenPartDialog = (event)=>{
        setAddNewPartTypeDialog(true);
    }


   
    const fields = [
        //type: select must be hyphenated ex select-type
        { field: 'description', label: 'Description', type: 'text',updateBy: 'ref', required:true }, 
        { field: 'inv_qty', label: 'In Stock',  type: 'number',updateBy: 'ref', hidden: (data)=> data?.rainey_id  },
        { field: 'min_inv', label: 'Minimum Inv',  type: 'number',updateBy: 'ref'  },
        { field: 'cost_each', label: 'Cost Each', type: 'number',updateBy: 'ref',  },
        { field: 'part_type', label: 'Part Type', type: 'select-part-type', required: true, updateBy: 'ref',
            addOn: ()=> {
                return <><AddEditPartTypeDialog part_type={{}} 
                                                refreshFunction={()=> { 
                                                    setPartTypes(null);
                                                }} 
                                                addNewPartTypeDialog={addNewPartTypeDialog} setAddNewPartTypeDialog={setAddNewPartTypeDialog}/>
                        <div className={classes.newTypeButton} onClick={(event)=> handleOpenPartDialog(event)}>Add New Part Type</div>
                        </>
            }},
        
        { field: 'storage_location', label: 'Storage Location',  type: 'number',updateBy: 'ref',  },
        { field: 'notes', label: 'Notes',  type: 'text',updateBy: 'ref',}, 
        { field: 'reel_width', label: 'Reel Width',  type: 'text',updateBy: 'ref',  },
        { field: 'obsolete', label: 'Obsolete',   type: 'check',updateBy: 'ref', },
    ];

    //Set active worker to a tmp value for add otherwise activeworker will be set to edit
    useEffect(()=>{
        if(setEditPartModalMode == "add"){
            setActivePart({});
        }
    },[setEditPartModalMode])

    

    useEffect(()=>{
            if(partTypes == null){
                Inventory.getPartTypes()
                .then((data)=>{
                    setPartTypes(data);
                })
                .catch((error)=>{
                    console.error("Failed to get entity types for entity addedit form")
                })
            }
    },[activePart, partTypes])

    useEffect(()=>{
        if(activePart && _.isEmpty(activePart) && saveRef?.current){
            saveRef.current.handleResetFormToDefault();
        }
    },[activePart])

        

    const handleSave = (part, updatePart ,addOrEdit, add_and_continue) => {

        return new Promise((resolve, reject)=>{
            if(!updatePart){
                console.error("Bad updatePart")
                reject("Bad updatePart");
            }
            
            //Add Id to this new object
            if(addOrEdit == "edit"){
                if(!part){
                    console.error("Bad part in edit")
                    reject("Bad updatePart");
                }
                updatePart["rainey_id"] = part.rainey_id;
                updatePart["date_updated"] = moment().format('YYYY-MM-DD HH:mm:ss');

                Inventory.updatePart( updatePart )
                .then( (data) => {
                    //Refetch our data on save
                    cogoToast.success(`Part ${part.rainey_id} has been updated!`, {hideAfter: 4});
                    setPartsRefetch(true);
                    setActivePart(null);
                    handleCloseModal();
                    
                    resolve(data)
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error updating part. ` , {hideAfter: 4});
                    reject(error)
                })
            }
            if(addOrEdit == "add"){
                Inventory.addNewPart( updatePart )
                .then( (data) => {
                    //Get id of new workorder and set view to detail
                    cogoToast.success(`Part has been added!`, {hideAfter: 4});
                    setPartsRefetch(true);
                    if(add_and_continue){
                        setActivePart({});
                    }else{
                        if(data && data.insertId){
                            console.log("Data",data);
                            setDetailPartId(data.insertId);
                            //should do this in a post save function to prevent memory leak
                            setCurrentView(views.filter((v)=>v.value == "partsDetail")[0]);
                        }
                        setActivePart(null);
                        handleCloseModal();
                    }
                    resolve(data);
                })
                .catch( error => {
                    console.warn(error);
                    cogoToast.error(`Error adding part. ` , {hideAfter: 4});
                    reject(error)
                })
            }
        })
    };

    const handleDeletePart = (part) => {
        if(!part || !part.rainey_id){
            console.error("Bad part in delete Part");
            return;
        }

        const deleteEnt = () =>{
            Inventory.deletePart(part.rainey_id)
            .then((data)=>{
                setPartsRefetch(true);
                handleCloseModal();
                setCurrentView(views.filter((v)=>v.value == "partsList")[0]);
                cogoToast.success("Deleted Part: " + part.rainey_id);
            })
            .catch((error)=>{
                cogoToast.error("Failed to Delete part")
                console.error("Failed to delete part", error);
            })
        }

        confirmAlert({
            customUI: ({onClose}) => {
                return(
                    <ConfirmYesNo onYes={deleteEnt} onClose={onClose} customMessage={"Delete Part permanently?"}/>
                );
            }
        })
    }

    return(<>
        { editPartModalOpen && <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={editPartModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
            timeout: 500,
            }}
        >
            <Fade in={editPartModalOpen}>
                
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {detailPartId && activePart ? `Edit Rainey Part#: ${activePart.rainey_id}` : 'Add Part'} 
                        </span>
                    </div>
                

                    {/* BODY */}
                    
                    <Grid container >  
                        <Grid item xs={12} className={classes.paperScroll}>
                            <FormBuilder 
                                ref={saveRef}
                                fields={fields} 
                                mode={editPartModalMode} 
                                classes={classes} 
                                formObject={activePart} 
                                setFormObject={setActivePart}
                                handleClose={handleCloseModal} 
                                handleSave={handleSave}
                                partTypes={partTypes} />
                        </Grid>
                        
                    </Grid>
                    

                    {/* FOOTER */}
                    <Grid container >
                        <Grid item xs={12} className={classes.paper_footer}>
                        { editPartModalMode == "edit" && activePart?.rainey_id ? <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleDeletePart(activePart)}
                                    variant="contained"
                                    size="large"
                                    className={classes.deleteButton}
                                >
                                    <DeleteIcon />Delete
                        </Button></ButtonGroup> :<></>}
                        <ButtonGroup className={classes.buttonGroup}>
                            <Button
                                    onClick={() => handleCloseModal()}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    Close
                                </Button></ButtonGroup>
                            <ButtonGroup className={classes.buttonGroup}>
                                <Button
                                    onClick={ () => { saveRef.current.handleSaveParent(activePart) }}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    <SaveIcon />{activePart?.rainey_id  ? "Save" : "Add"}
                                </Button>
                                </ButtonGroup>
                                <ButtonGroup className={classes.buttonGroup}>
                                {!activePart?.rainey_id  ? <Button
                                    onClick={ (event) => { saveRef.current.handleSaveParent(activePart,event, true) }}
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    className={classes.saveButton}
                                >
                                    <SaveIcon />Add + New
                                </Button>
                                :   <></>}
                            </ButtonGroup>
                        </Grid>
                    </Grid>
                </div>
            </Fade>
    </Modal>}
    </>) 
    }

export default AddEditModal;

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
        width: '70%',
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
    deleteButton:{
        backgroundColor: '#c4492e',
        '&:hover':{
            backgroundColor: '#f81010',
        }
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
        width: '44%',
        
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
        flexBasis: '50%',
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
    newTypeButton:{
        fontFamily: 'arial',
        fontWeight: '600',
        background: 'linear-gradient( whitesmoke, #dbdbdb)',
        boxShadow: '1px 1px 2px 0px #5d7093',
        padding: '2px 5px',
        
        cursor: 'pointer',
        color: '#777',
        '&:hover':{
            color: '#666',
            background: 'linear-gradient( whitesmoke, #d4d4d4)',
            boxShadow: '1px 1px 2px 0px #666 ',
        }
    }
}));