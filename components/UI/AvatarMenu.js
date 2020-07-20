import React, {useState, useEffect} from "react";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Hidden from '@material-ui/core/Hidden';

import Link from 'next/link';
import Avatar from '@material-ui/core/Avatar';

const AvatarMenu = ({options, src, alt}) => {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget );
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  

   return (
      <div>
        <Avatar
          role="presentation"
          aria-owns="simple-menu"
          aria-haspopup="true"
          onClick={event => handleClick(event)}
          onKeyPress={event => handleClick(event)}
          src={src}
          alt={alt}
          style={{ margin: '0px 20px 0px auto', cursor: 'pointer' }}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose()}
        >
          <p />
          {options.map(option => (
            <div id="wrappingLink" key={option.text}>
              <Link href={option.href} as={option.as || option.href}>
                <a style={{ padding: '0px 20px' }}>{option.text}</a>
              </Link>
              <p />
            </div>
          ))}
        </Menu>
      </div>
    );
  }

AvatarMenu.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(String).isRequired,
};

export default AvatarMenu;