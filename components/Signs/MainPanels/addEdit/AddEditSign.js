import React, { useRef, useState, useEffect, useContext } from 'react';
import { makeStyles, Modal, Backdrop, Fade, Grid, ButtonGroup, Button, TextField, Select, MenuItem, Checkbox, IconButton, Radio, RadioGroup, FormControl, FormControlLabel, CircularProgress } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { confirmAlert } from 'react-confirm-alert'; // Import
import ConfirmYesNo from "../../../UI/ConfirmYesNo.js";
import Autocomplete from '@material-ui/lab/Autocomplete';
import cogoToast from 'cogo-toast';
import dynamic from 'next/dynamic';
const KeyBinding = dynamic(() => import('react-keybinding-component'), { ssr: false });
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, KeyboardDatePicker, TimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import FormBuilder from '../../../UI/FormComponents/FormBuilder.js';
import Settings from "../../../../js/Settings.js";
import Work_Orders from "../../../../js/Work_Orders.js";
import Signs from "../../../../js/Signs.js";
import { ListContext } from '../../SignContainer.js';
import { DetailContext } from '../../SignContainer.js';

let logger;
if (typeof window === 'undefined') {
    logger = require('../../../../logs.js');
}

const AddEditSignModal = function (props) {
    const { workOrders, setWorkOrders, rowDateRange, setDateRowRange, detailSignd, setDetailSignd, currentView, previousView, handleSetView, views, activeWorkOrder, setActiveWorkOrder, editWOModalOpen, setEditWOModalOpen, raineyUsers, user } = useContext(ListContext);
    const { editSignModalMode, setEditSignModalMode, activeSign, setActiveSign, resetSignForm, setResetSignForm, workOrderItems, setWorkOrderItems, editSignModalOpen, setEditSignModalOpen, vendorTypes } = useContext(DetailContext);
    
    const saveRef = React.createRef();
    const [saveButtonDisabled, setSaveButtonDisabled] = React.useState(false);
    const [createTempSignObj, setCreateTempSignObj] = React.useState(true);

    const classes = useStyles();

    useEffect(() => {
        if (resetSignForm && saveRef?.current) {
            //resets the form when you change something by state
            saveRef.current.handleResetFormToDefault();
            setResetSignForm(false);
        }
    }, [resetSignForm, saveRef]);

    const handleCloseModal = () => {
        setActiveSign(null);
        setEditSignModalOpen(false);
        setSaveButtonDisabled(false);
    };

    const Sign_fields = [
        //type: select must be hyphenated ex select-type
        { field: 'size', label: 'Size', type: 'text', updateBy: 'ref' },
        { field: 'quantity', label: 'Quantity', type: 'number', updateBy: 'ref', required: true },
        { field: 'description', label: 'Description', type: 'auto', updateBy: 'state', multiline: true, ref: React.useRef(null), second_column: true,
            dataGetterFunc: async () => {
                return new Promise(async function (resolve, reject) {
                    try {
                        var results = await Settings.getPastScoreboardParams("description");
                        resolve(results);
                    } catch (error) {
                        reject(error);
                        console.error("Failed to get descriptions", error);
                    }
                });
            }
        },
        // other fields...
    ];

    useEffect(() => {
        if (createTempSignObj && editSignModalOpen && editSignModalMode === 'add') {
            setActiveSign({
                item_type: 3,
                scoreboard_or_sign: 0,
                date_offset: 0,
                price: 0.00,
                quantity: 0, // Initialize quantity
                size: '',    // Initialize size
            });
            setCreateTempSignObj(false);
        }
    }, [editSignModalMode, editSignModalOpen, activeSign, createTempSignObj]);

    const handleSave = (Sign, updateItem, addOrEdit) => {
        if (saveButtonDisabled) {
            return;
        }
        setSaveButtonDisabled(true);

        return new Promise((resolve, reject) => {
            if (addOrEdit === 'add') {
                Signs.addSigntoInventory(updateItem, user)
                    .then((data) => {
                        cogoToast.success('Sign has been added!', { hideAfter: 4 });
                        setActiveSign({
                            item_type: 3,
                            scoreboard_or_sign: 0,
                            date_offset: 0,
                            price: 0.00,
                            quantity: 0, // Reinitialize quantity
                            size: '',    // Reinitialize size
                        });
                        setResetSignForm(true);
                        setSaveButtonDisabled(false);
                        resolve(data);
                    })
                    .catch((error) => {
                        console.warn(error);
                        setSaveButtonDisabled(false);
                        cogoToast.error('Error adding Sign.', { hideAfter: 4 });
                        reject(error);
                    });
            } else {
                if (logger) {
                    logger.log('bad addOrEdit');
                }
            }
            saveRef.current.focusField('quantity');
        });
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            // Prevent the default form submit behavior
            event.preventDefault();

            // Check if save is not disabled then call your save function
            if (!saveButtonDisabled) {
                // Trigger your save logic
                saveRef.current.handleSaveParent(activeSign);
            }
        }
    };

    const handleDeleteSign = (Sign) => {
        if (!Sign || !Sign.record_id) {
            console.error("Bad Sign in delete Sign");
            return;
        }

        const deleteSign = () => {
            Work_Orders.deleteWorkOrderItem(Sign.record_id, user)
                .then((data) => {
                    setWorkOrderItems(null);
                    setSaveButtonDisabled(false);
                    handleCloseModal();
                })
                .catch((error) => {
                    setSaveButtonDisabled(false);
                    cogoToast.error("Failed to Delete Sign");
                    console.error("Failed to delete Sign", error);
                });
        };

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <ConfirmYesNo onYes={deleteSign} onClose={onClose} customMessage={"Delete Work Order Item permanently?"} />
                );
            }
        });
    };

    if (!activeSign) {
        return null;
    };

    return (
        <>
            {editSignModalOpen &&
                <div className={classes.container}>
                    {/* HEAD */}
                    <div className={classes.modalTitleDiv}>
                        <span id="transition-modal-title" className={classes.modalTitle}>
                            {activeSign?.record_id ? `Edit Sign#: ${activeSign?.record_id}` : 'Add Work Order Item'}
                        </span>
                    </div>

                    {/* BODY */}
                    <form onSubmit={(event) => saveRef.current.handleSaveParent(activeSign, event)}>
                        <div onKeyDown={handleKeyPress}>
                            <Grid container className={classes.grid_container}>
                                <Grid item xs={12} className={classes.paperScroll}>
                                    {/*FORM*/}
                                    {editSignModalOpen &&
                                        <>
                                            <FormBuilder
                                                ref={saveRef}
                                                columns={true}
                                                id_pretext={"Sign_input"}
                                                fields={Sign_fields}
                                                mode={editSignModalMode}
                                                classes={classes}
                                                formObject={activeSign}
                                                setFormObject={setActiveSign}
                                                handleClose={handleCloseModal}
                                                handleSave={handleSave}
                                                dontCloseOnNoChangesSave={true}
                                            />
                                        </>
                                    }
                                </Grid>
                            </Grid>
                        </div>

                        {/* FOOTER */}
                        <Grid container>
                            <Grid item xs={12} className={classes.paper_footer}>
                                {editSignModalMode === "edit" && activeSign?.record_id ?
                                    <ButtonGroup className={classes.buttonGroup}>
                                        <Button
                                            onClick={() => handleDeleteSign(activeSign)}
                                            variant="contained"
                                            size="large"
                                            className={classes.deleteButton}
                                        >
                                            <DeleteIcon />Delete
                                        </Button>
                                    </ButtonGroup> : null}
                                <ButtonGroup className={classes.buttonGroup}>
                                    <Button
                                        onClick={() => handleCloseModal()}
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        className={classes.saveButton}
                                    >
                                        Close
                                    </Button>
                                </ButtonGroup>
                                <ButtonGroup className={classes.buttonGroup}>
                                    <Button
                                        disabled={saveButtonDisabled}
                                        type="submit"
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
                    </form>
                </div>
            }
        </>
    );
};

export default AddEditSignModal;




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
        // backgroundColor: theme.palette.background.paper,
        // boxShadow: theme.shadows[5],
        padding: '1% !important',
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
        width: '100%',
        textAlign: 'center',
        boxShadow: theme.shadows[5],
    },
    grid_container:{
        minHeight: 'auto',
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
    deleteButtonGroup: {
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
        width: '100%',
        minHeight: '25px',
    //   padding: '4px 0px 4px 0px',
    //   borderBottom: '1px solid #eee'
    },
    inputStyle:{
        padding: '2px 7px',
        width: '100%',
        
    },
    actualInputElement:{
        padding: '2px 7px !important',
        width: '100%',
        
      },
    inputStyleDate:{
        padding: '5px 7px',
        width: '175px',
        
    },
    inputRoot: {
        padding: '3px 7px',
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
    radioGroup:{
        flexWrap: 'nowrap',
        justifyContent: 'center'
    },
    radioFormControl:{
        flexBasis: '70%',
    },
    radio:{
        color: '#000 !important',
    },
    multiline:{
        padding: 0,
    },
    underline: {
        "&&&:before": {
          borderBottom: "none"
        },
        "&&:after": {
          borderBottom: "none"
        },
        border: '1px solid #c4c4c4',
        borderRadius: 4,
        '&:hover':{
            border: '1px solid #555',
        }
    },
    optionLi:{
        padding: 0,
        borderBottom: '1px solid #ececec',
        minWidth: '100%',
        '&:last-child':{
            borderBottom: '1px solid #fff'
        },
       
    },
    optionList:{
        padding: '5px 1px 5px 1px',
        border: '1px solid #888',
        borderTop: "none",
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'stretch',
        minWidth: '100%'
    },
    optionDiv:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        width: '100%',
        backgroundColor: '#fff',
        borderLeft: '2px solid #fff',
         '&:hover':{
          backgroundColor: '#d3d3d3',
          borderLeft: '2px solid #ff9007'
        },
      },
      optionSearchValueSpan:{
        fontFamily: 'sans-serif',
        color: '#000',
        overflow: 'hidden',
        maxWidth: 'auto',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '1px 5px 1px 5px',
      },
      optionSearchResultsSpan:{
        padding: '4px 5px 4px 10px',
        fontFamily: 'sans-serif',
        color: '#888',
        flexBasis: '20%'
      },
      autocompleteRoot:{
          width: '70%',
      },
      formColumnStyle:{
        display: 'grid',
        gridTemplateRows: 'repeat(20,auto)',/*big enough*/
        gridAutoColumns: '1fr',
        gridAutoFlow:'column', /*column direction*/
        gridGap: 1,
      },
  
      
}));

