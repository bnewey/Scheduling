import React, {Component} from 'react';
import dynamic from 'next/dynamic';
import {TableCell, TableHead, TableRow, TableSortLabel, Checkbox, Tooltip, Button} from '@material-ui/core';
const TableFilter = dynamic(
    () => import('react-table-filter'),
    {
        ssr: false
    }
)


class EnhancedTableHeadClass extends React.Component {

    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = { filteredRows: this.props.filteredRows, filterUpdated: this.props.filterUpdated, 
            createSortHandler: this.props.createSortHandler, headCells: this.props.headCells, filterConfig: this.props.filterConfig, order:this.props.order
            , orderBy: this.props.orderBy };
        this.tableFilterNode;
        
    }

    componentDidMount() {
        this.setState({ filteredRows: this.props.filteredRows, filterUpdated: this.props.filterUpdated, 
            createSortHandler: this.props.createSortHandler, headCells: this.props.headCells, filterConfig: this.props.filterConfig, order:this.props.order
            , orderBy: this.props.orderBy  })
    }

    componentDidUpdate() {
        console.log("ASd",this.tableFilterNode);
    }

    render() {
        const filteredRows = this.state.filteredRows;
        const filterUpdated = this.state.filterUpdated;
        const createSortHandler = this.state.createSortHandler;
        const headCells = this.state.headCells;
        const filterConfig = this.state.filterConfig;
        const order = this.state.order;
        const orderBy = this.state.orderBy;
        
      return (
        <TableFilter
            rows={filteredRows}
            onFilterUpdate={filterUpdated}
            initialFilters={filterConfig ? filterConfig : null}
            //className={classes.tableFilter}
            ref={ (node) => { console.log("NODE2", node); this.tableFilterNode = node}}
        >
      {headCells.map((headCell, i) => (
        <TableCell
          key={headCell.id}
          align={ 'center'}
          padding={headCell.disablePadding ? 'none' : 'default'}
          sortDirection={orderBy === headCell.id ? order : false}
          filterkey={headCell.id}
          //className={classes.tableHead}

          alignleft={i != 0 ? "true" : "false"}
          
        >
          <TableSortLabel
            active={orderBy === headCell.id}
            direction={order}
            onClick={createSortHandler(headCell.id)}
          >
            {headCell.label}
            {orderBy === headCell.id ? (
              <div /*className={classes.visuallyHidden}*/>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </div>
            ) : <></>}
          </TableSortLabel>
        </TableCell>
      ))}
      </TableFilter>
      );
    }
  }

  export default EnhancedTableHeadClass;