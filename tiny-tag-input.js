/* Copyright (c) 2024 Aristotle Pagaltzis {{{

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. }}} */
function makeTagInputs ( className ) {
	function updateSuggestions ( tagInput ) {
		var wrapper = tagInput.parentNode, list = tagInput.list, selected = {}, value = '';
		wrapper.querySelectorAll( 'button.' + className ).forEach( function ( tagButton ) {
			selected[ tagButton.textContent ] = 1;
			value += ( value.length ? ', ' : '' ) + tagButton.textContent;
		} );
		wrapper.querySelector( 'input[type="hidden"]' ).value = value;
		list && [].forEach.call( list.children, function ( it ) {
			it.disabled = ( it.value in selected );
		} );
	}
	function addTagButton ( tagInput, content, isTabbable ) {
		var tagButton = document.createElement( 'button' );
		tagButton.setAttribute( 'type', 'button' );
		isTabbable || tagButton.setAttribute( 'tabindex', '-1' );
		tagButton.className = className;
		tagButton.textContent = content.trim();
		tagButton.onclick = onTagButtonClick;
		tagButton.onkeydown = onTagButtonKeyDown;
		tagInput.parentNode.insertBefore( tagButton, tagInput );
	}
	function onTagButtonClick ( e ) {
		var self = e.target, wrapper = self.parentNode, next = self.nextElementSibling;
		wrapper.removeChild( self );
		updateSuggestions( wrapper.querySelector( 'input.' + className ) );
		next.focus();
	}
	function onTagButtonKeyDown ( e ) {
		var self = e.target, wrapper = self.parentNode, dest;
		switch ( e.key ) {
			case 'ArrowRight': dest = self.nextElementSibling; break;
			case 'ArrowLeft':  dest = self.previousElementSibling; break;
			case 'Backspace': onTagButtonClick( e ); return;
		}
		if ( dest ) {
			e.preventDefault();
			dest.focus();
		}
	}
	function onTagInputChange ( e ) {
		var self = e.target, content = self.value;
		if ( ! /\S/.test( content ) ) return;
		addTagButton( self, content, true );
		updateSuggestions( self );
		self.value = '';
	};
	function onTagInputKeyDown ( e ) {
		var isCursorAtStart = e.target.selectionStart == 0;
		if ( typeof e.key === 'undefined' ) { // representation of a click on a suggestion
			e.target.value = ''; // trigger onchange even if e.target.value == clicked suggestion
		} else switch ( e.key ) {
			case ',':
			case 'Enter':
				if ( ! isCursorAtStart ) onTagInputChange( e );
				e.preventDefault();
				return;
			case 'Backspace':
				if ( /\S/.test( e.target.value ) ) return;
			case 'ArrowLeft':
				if ( ! isCursorAtStart ) return;
				var wrapper = e.target.parentNode,
					tagButton = wrapper.querySelector( 'button.' + className + ':last-of-type' );
				if ( tagButton ) {
					e.preventDefault()
					tagButton.focus();
				}
		}
	}
	document.querySelectorAll( 'input.' + className ).forEach( function ( tagInput ) {
		if ( tagInput.onchange !== null ) return;
		var wrapper = document.createElement( 'div' );
		wrapper.className = className;
		tagInput.parentNode.insertBefore( wrapper, tagInput );
		wrapper.appendChild( tagInput );
		var formElt = document.createElement( 'input' );
		formElt.setAttribute( 'type', 'hidden' );
		formElt.value = tagInput.value;
		formElt.name = tagInput.name;
		tagInput.parentNode.appendChild( formElt );
		/\S/.test( tagInput.value ) && tagInput.value.split( /\s*,\s*/ ).forEach( function ( it ) {
			addTagButton( tagInput, it, false );
		} );
		tagInput.removeAttribute( 'name' );
		tagInput.removeAttribute( 'value' );
		tagInput.onchange = onTagInputChange;
		tagInput.onfocus = tagInput.onblur = function ( e ) { updateSuggestions( e.target ) };
		tagInput.onkeydown = onTagInputKeyDown;
	} );
}
// vim: fdm=marker ts=4 sts=4 sw=4
