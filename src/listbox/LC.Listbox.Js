/* 
   @author Charlie Rudenstål 
   @url https://github.com/charlie-rudenstal/LightweightUI-Components-html5-js 
*/

var LC = LC || {};

LC.Listbox = function(options)
{
    var me = {};
    var _element;
    var _itemTemplate;

    var _items = [];
    var _multipleSelection;

    me.init = function()
    {
        _element = options.element;
        _multipleSelection = options.multipleSelection || false;

        // Retrieve all items that are already populated in the element
        LC.Element.foreachChild(_element, function(child)
        {
            _items.push({
                content: child.innerHTML,
                value: child.value
            });
        });
    
        // Register click handler for selection
        _element.addEventListener("mousedown", onListboxClicked, true);
        _element.addEventListener("keydown", onListboxKeydown, true);

        me.invalidateItems();
    };

    var onListboxClicked = function(e)
    {
        // Get the clicked item element
        var elmItem = e.target;
        if(elmItem == null) return;

        // Find which direct child of the Listbox the item belongs to
        // (if user clicked an element that was nested)
        while(elmItem.parentNode != _element)
        {
            elmItem = elmItem.parentNode;
        }

        // Get index of element in list
        for(var index = 0, em = elmItem; em = em.previousSibling; ++index);

        var isMultipleSelect = _multipleSelection && (e.shiftKey || e.ctrlKey || e.altKey);

        // Get the item object and mark it as selected
        // and deselect other items if multiple selection is disabled
        for(var i in _items)
        {
            // Actions for the item that was clicked
            if(i == index)
            {
                // If mutliple select is enabled and a modifier key was pressed
                // the selection should toggle
                if(isMultipleSelect)
                {
                    _items[i].selected = !_items[i].selected;
                }
                // Otherwise just select the item no matter what
                else
                {
                    _items[i].selected = true;
                }
            }
            // For all other items
            else if(isMultipleSelect) 
            {
                // Do nothing, do not remove old selection if multiple selection
                // is enabled and a modifier key is pressed. 
                // This will allow for multiple selection
            }
            else
            {
                // Remove old selection
                _items[i].selected = false;
            }
        }

        trigger("itemSelected", _items[index]);
        me.invalidateSelection();
    };

    var onListboxKeydown = function(e)
    {
        //console.log("key down");
    }

    me.invalidateSelection = function()
    {
        var listElements = _element.childNodes;
        for(var i in listElements)
        {
            if(listElements[i].nodeType != 1) continue; // ignore non-elements
            
            var listElement = listElements[i];
            var item = _items[i];
            if(item.selected)
            {
                LC.Element.addClass(listElement, "selected");
            }
            else
            {
                LC.Element.removeClass(listElement, "selected");
            }
        }
    };  

    me.invalidateItems = function()
    {
        var elmTemplate = getItemTemplate();

        var htmlItems = "";
        for(var i in _items)
        {
            var item = _items[i];
            htmlItems += LC.Templating.render(elmTemplate, item, true);
        }
        _element.innerHTML = htmlItems;
    };

    me.setItems = function(items)
    {
        _items = items;
    }

    var getItemTemplate = function()
    {
        if(!_itemTemplate) 
        {
            // Try to find a child with the class "template" inside the element and use that
            // Don't forget the remove the .template class from the template or else all generated
            // elements would inherit it
            _itemTemplate = LC.Lib.Sizzle(".template", _element)[0];
            if(_itemTemplate) 
            {
                LC.Element.removeClass(_itemTemplate, ".template");
            }

            // Otherwise fallback to a clone of the first child and clear its innerHTML
            // so that we at least get an element with the same type as its sibblings    
            if(!_itemTemplate)
            {
                // Find first real element among child nodes
                var firstChild = new LC.Enumerable(_element.childNodes)
                                    .first(LC.Element.isValidNode);

                // And use it
                if(firstChild)
                {
                    _itemTemplate = firstChild.cloneNode(true);
                    _itemTemplate.innerHTML = "[content]";
                }
            }

            // As a last resort, use a div
            if(!_itemTemplate)
            {
                _itemTemplate = document.createElement("div");
                _itemTemplate.innerHTML = "[content]";
            }

        }
        return _itemTemplate;
    };

    // This module supports events
    me.on = function(eventName, callback)
    {
        LC.Events.on(me, eventName, callback);
    };

    var trigger = function(eventName, parameters)
    {
        LC.Events.trigger(me, eventName, parameters);
    };

    me.init();
    return me;
};

// Manual attachment.
LC.Listbox.apply = function(elements, options)
{
    return LC.Component.apply(LC.Listbox, elements, options);
}

// Automatic attachment. Applies the LC.Listbox to all selects with size != 0
// or with any element using data-component="listbox"
LC.Listbox.applyAll = function(options)
{
    return LC.Listbox.apply("select[size!=0], *[data-component=listbox]", options);    
}