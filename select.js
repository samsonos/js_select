/**
 * SamsonJS Select plugin
 * 
 * Расширение функционала JavaScript фреймоворка SamsonJS
 * для работы с элементом формы Select
 * 
 */
SamsonJS.extend({
	
	/** Повесить плагин на элемент формы SELECT */
	selectify : function()
	{
		// Указатель на текущий селект 
		var o = this;

		// Родительский контейнер плагина
		var parent = s('<div class="_sjsselect_parent clearfix"></div>');
		
		// Контейнер плагина
		var container = s('<ul class="_sjsselect clearfix" tabindex="-1"></ul>');
		
		// Контейнер для выпадающего списка
		var dropdown = s('<ul class="_sjsselect_dropdown"></ul>');
		
		// Блок для поля ввода для поиска
		var inputBlock = s('<li id="_sjsselect_search"></li>');

		// Поле ввода для поиска
		var search = s('<input type="text">');

        var lastAdded;

        // Create input for order storing
        var orderBlock = s('<input type="hidden" name="_order'+this.a('name')+'">');

        // Create elememnt to store selected values order
        o.selected = {};
		
		// Сформируем основные блоки
		inputBlock.append(search);
		container.append(inputBlock);
		parent.append(container);
		parent.append(dropdown);
        parent.append(orderBlock);

		
		// Если это не селект - ничего не делаем
		if(!o.is('SELECT')) return o;

		/** Обрабочик удаления опции */
		var removeOption = function( li )
		{				
			// Получим опцию
			var option = li.__block;

            // Remove selected value
            delete o.selected[option.val()];
            saveOrder();
			
			// Удалим блок
			if( li ) li.remove();
			
			// Если есть указетль на опцию в списке
			if( option ) 
			{
				// Покажем опцию
				option.removeClass('hidden');
				
				// Если есть ссылка на оригинал опции в селекте - установим его
				if( option._origin ) option._origin.a('selected','');
			}
		};

        /** */
        var saveOrder = function()
        {
            var value = '';
            for (var item in o.selected) {
                value += item+',';
            }
            orderBlock.val(value);
        }
		
		/** Обработчик выбора опции */
		var addOption = function( option )
		{				
			// Спрячем список
			endSelection();
			
			// Создадим блок в контейнере плагина
			var li = s('<li value="'+option.val()+'"><span class="_sjsselect_text">'+option.text()+'</span><span class="_sjsselect_delete"></span></li>');
			
			// Свяжем блок с опцией
			li.__block = option;

            // Store selected value
            o.selected[option.val()] = option;
            saveOrder();
			
			// Повесим событие на удаление опции
			s( '._sjsselect_delete', li ).click( function(){ removeOption( li ); }, true, true );
			
			// Выведем выбранную опцию в контейнер плагина
			inputBlock.insertBefore( li );

            lastAdded = li;
			
			// Если есть ссылка на оригинал опции в селекте - установим его
			if( option._origin )option._origin.a('selected','selected');
			
			// Спрячем опцию
			option.addClass('hidden');

            // Clear search field
            search.val('');
		};	
		
		/** Обработчик завершения выбора элемента */
		var endSelection = function()
		{			
			container.removeClass('focused');
			search.blur();			
			dropdown.hide();
		};
		
		/** Обработчик активации элемента */
		var startSelection = function()
		{
            if (o.DOMElement.hasAttribute('single')) {
                if (lastAdded !== undefined) {
                    removeOption(lastAdded);
                }
            }
			search.focus();
			
			var offset = search.offset();
			dropdown.top(offset.top);				
			dropdown.show();
            s('li', dropdown).show();
			
			container.addClass('focused');
		};
		
		/** Инициализировать плагин */
		var init = function()
		{
            // Change parent width to fixed select width, for giving designers ability
            // to set element width

            if (o.css('width')) {
                parent.width(o.css('width'));
            }
			
			// Получим все опции селекта
			var _options = s( 'option', o).elements;

            // Спрячем селект
            o.hide();
			
			// Пометим каждую опцию специальным классом
			if (_options) for ( var i = 0; i < _options.length; i++) 
			{	
				// Получим опцию
				var _option = _options[i];	
				
				// Создадим её представление для выпадающего списка
				var option = s('<li value="'+_option.val()+'">'+_option.text()+'</li>');
				
				// Сохраним ссылку на оригинал опции
				option._origin = _option;
				
				// Добавим опцию в выпадающий список
				dropdown.append( option );
				
				// Повесим обработчик нажатия на опцию
				option.click( addOption, true, true );
				
				// Если опция выбрана добавим её сразу
				if( _option.a('selected')) addOption(option);
			}

            // Bind option search
            search.keyup(function(input){
                var value = input.val();
                // Create matching pattern
                var pattern = new RegExp(value,'i');
                // If we have some input
                if (value.length && value != '') {
                    // Hide all li's and iterate them
                    s('li:not(.hidden)', dropdown).hide().each(function(li){
                        // Show li if it matches pattern
                        if (li.text().match(pattern)) {
                            li.show();
                        }
                    });
                } else { // Show all options
                    s('li', dropdown).show();
                }
            });
			
			// Обработчик потере элементом фокуса
			s('body').click(endSelection);
			
			// Обработчик фокуса на контейнере
			container.click(startSelection, true, true );
			
			// Вставим контейнер плагина перед селектом
			o.insertBefore(parent);
		};			
		
		// Инициализируем плагин
		init();
	}
});
