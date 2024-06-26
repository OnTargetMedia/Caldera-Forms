/**
 * Dynamic Field Configuration
 *
 * @since 1.5.0
 *
 * @param configs
 * @param $form
 * @param $ {jQuery}
 * @param state {CFState} @since 1.5.3
 *
 * @constructor
 */
 function Caldera_Forms_Field_Config( configs, $form, $, state ){
     var self = this;

     var fields = {};

     var formInstance = $form.data( 'instance' );

     var $submits = $form.find(':submit, .cf-page-btn-next' );


    /**
      * Start system
      *
      * @since 1.5.0
      */
     this.init = function(){
         $.each( configs, function( i, config ){
             fields[ config.id ] = self[config.type]( config );
         } );

         setupInputMasks();
		 $( document ).on( 'cf.add', setupInputMasks );
	 };

     /**
      * Validation handler for adding/removing errors for field types
      *
      * @since 1.5.0
      *
      * @param valid
      * @param $field
      * @param message
      * @param extraClass
      * @returns {boolean}
      */
     function handleValidationMarkup( valid, $field, message, extraClass ){
         var $parent = $field.parent().parent();
         $parent.removeClass( 'has-error' );
         $parent.find( '.help-block' ).remove();
         if( ! valid ){
             $parent.addClass( 'has-error' ).append( '<span id="cf-error-'+ $field.attr('id') +'" class="help-block ' + extraClass +'">' + message  + '</span>' );
             if ( $field.prop( 'required' ) ) {
                 disableAdvance($field);
             }
             $field.addClass( 'parsely-error' );
             return false;
         }else{
             $parent.removeClass( 'has-error' );
             allowAdvance();
             return true;
         }
     }

    /**
     * Check if field is on the current page of a multi-page form.
     *
     * @since 1.5.8
     *
     * @param {jQuery} $field jQuery object of field to test.
     *
     * @return {Bool}
     */
    function fieldIsOnCurrentPage($field) {
        return ! $field.closest('.caldera-form-page').attr('aria-hidden');
    }


    /**
     * Get field of page field is on if on a multi-page form.
     *
     * @since 1.5.8
     *
     * @param {jQuery} $field jQuery object of field to test.
     *
     * @return {Bool}
     */
    function getFieldPage($field) {
        return $field.closest( '.caldera-form-page' ).data( 'formpage' );
    }

    /**
      * Utility method for preventing advance (next page/submit)
      *
      * @since 1.5.0
      */
     function disableAdvance($field){
         if( fieldIsOnCurrentPage($field) ){
             $submits.prop( 'disabled',true).attr( 'aria-disabled', true  );
         }

     }

     /**
      * Utility method for allowing advance (next page/submit)
      *
      * @since 1.5.0
      */
     function allowAdvance(){
         $submits.prop( 'disabled',false).attr( 'aria-disabled', false  );
     }

     function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


     /**
      * Handler for button fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.button = function( field ){
         var field_id  = field.id;
         $(document).on('click dblclick', '#' + field_id, function( e ){
             $('#' + field_id + '_btn').val( e.type ).trigger('change');
         });
     };


     /**
      * Handler for HTML fields (and summary fields since this.summary is alias of this.html)
      *
      * @since 1.5.0
      *
      * @param fieldConfig
      */
     this.html = function ( fieldConfig ) {
         if( false == fieldConfig.sync ){
             return;
         }

		 var templates = {},
			 bindMap = fieldConfig.bindFields,
			 templateSystem,
			 $target = $( document.getElementById( fieldConfig.contentId ) ),
			 regex = {};
		 templateSystem = function () {

		     if( ! $target.length ){
                 $target = $( document.getElementById( fieldConfig.contentId ) );
             }

             if( ! $target.length ){
                 return;
             }

			 if (undefined == templates[fieldConfig.tmplId]) {
				 templates[fieldConfig.tmplId] = $(document.getElementById(fieldConfig.tmplId)).html();
			 }
			 var output = templates[fieldConfig.tmplId];

			 var value;
			 for (var i = 0; i <= bindMap.length; i++) {
			 	if( 'object' === typeof   bindMap[i] &&  bindMap[i].hasOwnProperty( 'to' ) && bindMap[i].hasOwnProperty( 'tag' ) ){

					value = state.getState(bindMap[i].to);
					if( 0 !== value && '0' !== value && ! value ){
						value = '';
                    }else if( ! isNaN( value ) ){
                        value = value.toString();
                    } else if( 'string' === typeof  value ){
						value = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
					}else  if( ! value || undefined == value.join || undefined === value || 'undefined' == typeof value){
						value = '';
					} else{
						value = value.join(', ');
					}
					output = output.replace( bindMap[i].tag, value );

				}


			 }

			 $target.html(output).trigger('change');
		 };

		 (function bind() {
			 for (var i = 0; i <= bindMap.length; i++) {
			 	if( 'object' === typeof  bindMap[i] && bindMap[i].hasOwnProperty( 'to' ) ){
					state.events().subscribe(bindMap[i].to, templateSystem);
				}
			 }
             $(document).on('cf.pagenav cf.modal', templateSystem );
		 }());

         templateSystem();
	 };

     /**
      * Handler to summary fields
      *
      * A copy of handler for HTML fields
      *
      * @since 1.5.0
      *
      * @type {any}
      */
     this.summary = this.html;

    var rangeSliders = {};

     /**
      * Handler for range slider fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.range_slider = function( field ){
         var $el = $(document.getElementById(field.id));

         function setCss($el){
             $el.parent().find('.rangeslider').css('backgroundColor', field.trackcolor);
             $el.parent().find('.rangeslider__fill').css('backgroundColor', field.color);
             $el.parent().find('.rangeslider__handle').css('backgroundColor', field.handle).css('borderColor', field.handleborder);
         }

         function init() {


             if ('object' != rangeSliders[field.id]) {
                 rangeSliders[field.id] = {
                     value: field.default,
                     init: {},
					 inited : false
                 };
             }



             var init = {
				 onSlide: function (position, value) {
                     state.mutateState(field.id, value );
                     rangeSliders[field.id].value = value;
				 },
                 onInit: function () {
                     this.value = state.getState(field.id);
					 rangeSliders[field.id].inited = true;
                     setCss($el);
                 },
                 polyfill: false
             };

             rangeSliders[field.id].init = init;
             state.events().subscribe(field.id, function ( eventFieldIdArray, value ) {
                 if( value.length <= 0 ){
					 value = field.default;
                 }
				 $('#' + field.id + '_value').html( value );

             });

             if( ! $el.is( ':visible') ){
                 return;
             }

             $el.rangeslider(init);


         }


         $(document).on('cf.pagenav cf.add cf.disable cf.modal', function () {
             var el = document.getElementById(field.id);
             if (null != el) {

                 var $el = $(el),
                     val = rangeSliders[field.id].value;
                 if( ! $el.is( ':visible') ){
                     return;
                 }

                 $el.val( val );
				 $el.rangeslider('destroy');
				 $el.rangeslider(rangeSliders[field.id].init);
                 $el.val( val ).change();
                 setCss($el);

                 state.mutateState(field.id, val );
             }
         });

		 init();


     };

     /**
      * Handler for star ratings fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.star_rating = function( field ){

         var score = field.options.score;
         var $el = $( document.getElementById( field.starFieldId ) );
         var $input = $( document.getElementById( field.id ) );
         var init =  function(){
             var options = field.options;

             options[ 'click' ] = function(){
                 score = $el.raty('score');
                 $el.trigger( 'change' );
             };
             $el.raty(
                 options
             );


             $el.raty('score', score );
         };

         init();
         var updating = false;
        jQuery( document ).on('cf.add', function(){

            if( false === updating ){
                updating = true;
                if( $el.length ){
                    $el.raty( 'destroy' );
                    init();
                }
                setTimeout(function(){
                    updating = false
                }, 500 );
            }



        } );
     };

     /**
      * Handler for new toggle swich fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.toggle_switch = function( field ) {
         $( document ).on('reset', '#' + field.id, function(e){
             $.each( field.options, function( i, option ){
                 $( document.getElemenetById( option ) ).removeClass( field.selectedClassName ).addClass( field.defaultClassName );
             });
             $( document.getElementById( field.id )).prop('checked','');
         } );
     };

     /**
      * Handler for new phone fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.phone_better = function( field ){

         var fieldId = field.id;
         var isValid = true;
         var reset = function(){
             var error = document.getElementById( 'cf-error-'+ fieldId );
			 isValid = true;
             if( null != error ){
                 error.remove();
             }
         };

         var validation = function () {
             var $field = $( document.getElementById( fieldId ) );
             reset();
             var valid;
             var value = $.trim($field.val());
             if (value) {
                 if ($field.intlTelInput("isValidNumber")) {
                     valid = true;
                 } else {
                     valid = false;
                 }
             }

             var message;
             var errorCode = $field.intlTelInput("getValidationError");
             var selectedCountryData = $field.intlTelInput("getSelectedCountryData");

             if (0 == errorCode) {
                 valid = true;
                 message = '';
             } else if (value ==  "+" + selectedCountryData.dialCode){
                 valid = true;
                 message = '';
             } else if (!value) {
                 valid = true;
                 message = '';
             } else {
                 if ('undefined' != field.messages[errorCode]) {
                     message = field.messages[errorCode]
                 } else {
                     message = field.messages.generic;
                 }
             }

			 isValid = valid;
             handleValidationMarkup(valid, $field, message, 'help-block-phone_better');
             return valid;
         };

         var init = function() {
             $field = $( document.getElementById( fieldId ) );

             $field.intlTelInput( field.options );
             $field.on( 'keyup change', reset );
             $field.blur(function() {
                 reset();
                 validation();
             });

             $field.on( 'keyup change', validation );
             $form.on( 'submit', function(){
                 validation();
             })

         };

         $(document).on('cf.pagenav cf.add cf.disable cf.modal', init );
         $(document).on('cf.add', function(){
           reset();
           validation();
         });

        //Run Phone_better field validation when a submit or next page button is clicked
       $('#' + field.form_id_attr + ' [data-page="next"], #' + field.form_id_attr + ' form.caldera_forms_form [type="submit"]').click( function(e){
         var valid = validation();
         if( valid === false ){
           e.preventDefault();
           e.stopPropagation();
         }
       });



		 $(document).on('cf.remove', function(event,obj){
			 if( obj.hasOwnProperty('field') && fieldId === obj.field ){
			     if( ! isValid ){
			         allowAdvance();
                 }
             }
		 } );

         init();

     };

     /**
      * Handler for WYSIWYG fields
      *
      * @since 1.5.0
      *
      * @param field
      */
     this.wysiwyg = function( field ){

         var actual_field = document.getElementById( field.id );
         if( null != actual_field ){
             var $field = $( actual_field );
             $field.trumbowyg(field.options);
             var $editor = $field.parent().find( '.trumbowyg-editor');

             $editor.html( $field.val() );
             $editor.bind('input propertychange', function(){
                 $field.val( $editor.html() );
             });
         }

     };

     /**
      * Handler for credit card fields
      *
      * @since 1.5.0
      *
      * @param fieldConfig
      */
     this.credit_card_number = function( fieldConfig ){
         var $field = $( document.getElementById( fieldConfig.id ) );

         if( false != fieldConfig.exp || false != fieldConfig.cvc ){
             setupLink();
         }

         if( $field.length ){
             $field.payment('formatCardNumber');
             $field.blur( function(){
                 var val =  $field.val();
                 var valid = $.payment.validateCardNumber( val );
                 var type = $.payment.cardType(val);
                 handleValidationMarkup( valid, $field, fieldConfig.invalid, 'help-block-credit_card_number help-block-credit_card' );
                 if( valid ){
                     setImage( type );
                 }
             })
         }

         /**
          * Link fields in credit card group
          *
          * @since 1.5.0
          *
          */
         function setupLink(){
             disableAdvance($field);
             var $cvcField = $( document.getElementById( fieldConfig.cvc ) ),
                 $expField = $( document.getElementById( fieldConfig.exp ) );
             $cvcField.blur( function(){
                 if ( $cvcField.val() ) {
                     self.creditCardUtil.validateCVC($field, $cvcField);
                 }
                 if ( $expField.val() ) {
                     self.creditCardUtil.validateExp($expField);
                 }
             });
         }

         /**
          * If possible change the icon in the credit card input
          *
          * @since 1.5.0
          *
          * @param type
          */
         function setImage( type ){
             var iconTypes = {
                 0: 'amex',
                 1: 'discover',
                 2: 'visa',
                 3: 'discover',
                 4: 'mastercard'
             };
             var icon = 'credit-card.svg';
             $.each( iconTypes, function( i, card ){
                if( 0 === type.indexOf( card ) ){
                    icon = 'cc-' + card + '.svg';
                    return false;
                }
             });

             $field.css( 'background', 'url("' + fieldConfig.imgPath + icon + '")' );

         }

     };

     /**
      * Handler for credit card expiration fields
      *
      * @since 1.5.0
      *
      * @param fieldConfig
      */
     this.credit_card_exp = function ( fieldConfig ) {
         var $field = $( document.getElementById( fieldConfig.id ) );
         if( $field.length ){
             $field.payment('formatCardExpiry');
             $field.blur( function () {
                 var valid = self.creditCardUtil.validateExp( $field );
                 handleValidationMarkup( valid, $field, fieldConfig.invalid, 'help-block-credit_card_exp help-block-credit_card' );
             });
         }
     };

     /**
      * Handler for credit card secret code fields
      *
      * @since 1.5.0
      *
      * @param fieldConfig
      */
     this.credit_card_cvc = function ( fieldConfig ) {
         var $field = $( document.getElementById( fieldConfig.id ) );
         if( $field.length ){
             $field.payment('formatCardCVC');
             if( false !== fieldConfig.ccField ) {
                 var $ccField = $( document.getElementById( fieldConfig.ccField ) );
                 $field.blur( function () {
                     var valid = self.creditCardUtil.validateExp( $ccField, $field);
                     handleValidationMarkup(valid, $field, fieldConfig.invalid, 'help-block-credit_card_cvc help-block-credit_card');
                 });
             }

         }
     };

     /**
      * Validators for credit card CVC and expirations
      *
      * @since 1.5.0
      *
      * @type {{validateCVC: Caldera_Forms_Field_Config.creditCardUtil.validateCVC, validateExp: Caldera_Forms_Field_Config.creditCardUtil.validateExp}}
      */
     this.creditCardUtil = {
         validateCVC: function( $ccField, $cvcField ){
             var val =  $cvcField.val();
             var cardValid = $.payment.validateCardNumber( $ccField.val() );
             var valid = false;
             if ( cardValid ) {
                 var type = $.payment.cardType( $ccField.val() );
                 valid = $.payment.validateCardCVC( val, type)
             }

             return valid;
         },
         validateExp: function ($expField) {
             var val = $expField.val().split('/');
             if (  val && 2 == val.length ) {
                 return $.payment.validateCardExpiry(val[0].trim(), val[1].trim());
             }
         }

     };

     this.color_picker = function ( fieldConfig ) {
         $( document.getElementById( fieldConfig.id ) ).miniColors( fieldConfig.settings );
         $(document).on('cf.pagenav cf.add cf.disable cf.modal', function () {
             $(document.getElementById(fieldConfig.id)).miniColors(fieldConfig.settings);
         });
     };

	/**
	 * Process a calculation field
	 *
	 * @since 1.5.6
	 *
	 * @param fieldConfig
	 */
	this.calculation = function (fieldConfig) {
		var lastValue = null,
			/**
			 * Debounced version of the run() function below
			 *
			 * @since 1.5.6
			 */
            debouncedRunner = debounce(
                function(){
                    run(state)
                }, 250
            );

		/**
		 * Adds commas or whatever to the display fo value
		 *
		 * @since 1.5.6
		 *
		 * @param {string} nStr
		 * @returns {string}
		 */
		function addCommas(nStr){
			nStr += '';
			var x = nStr.split('.'),
				x1 = x[0],
				x2 = x.length > 1 ? fieldConfig.decimalSeparator + x[1] : '',
				rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {

				x1 = x1.replace(rgx, '$1' + fieldConfig.thousandSeparator + '$2');
			}
			return x1 + x2;
		}


		/**
         * Function that triggers calculation and updates state/DOM if it changed
         * NOTE: Don't use directly, use debounced version
         *
         * @since 1.5.6
         */
        var run = function(){

			var result = window[fieldConfig.callback].apply(null, [state] );
			if( ! isFinite( result ) ){
				result = 0;
			}

            lastValue = result;
            state.mutateState( fieldConfig.id, result );
            if( 'number' != typeof  result ){
                result = parseInt( result, 10 );
            }

            if( fieldConfig.moneyFormat ){
                result = result.toFixed(2);
            }

            $( '#' + fieldConfig.id ).html( addCommas( result ) ).data( 'calc-value', result );
            $('#' + fieldConfig.targetId ).val( result ).trigger( 'change' );

		};

		//Update when any field that is part of the formula changes
		$.each( fieldConfig.fieldBinds,  function (feild,feildId) {
			state.events().subscribe( feildId, debouncedRunner );
		});

		//Run on CF page change, field added, field removed or modal opened.
		$(document).on('cf.pagenav cf.add cf.remove cf.modal', function (e,obj) {
		    if( 'cf' == e.type && 'remove' === e.namespace && 'object' === typeof  obj && obj.hasOwnProperty('field' ) && obj.field === fieldConfig.id ){
		    	//If calculation field is removed, make sure if it comes back, an update to DOM/state will be triggered.
				lastValue = null;
            }else{
            	//If trigger wasn't being removed, run.
                debouncedRunner();

            }
		});

		debouncedRunner();

	};

    /**
     * Init color picker fields
     *
     * @since 1.6.2
     */
	this.color_picker = function(){
        function color_picker_init(){
            jQuery('.minicolor-picker').miniColors();
        }

        document.addEventListener('load', color_picker_init , false);

        jQuery( document ).ajaxComplete(function() {
            color_picker_init();
        });
    };


    /**
     * Add input mask to any field that has the data attributes for it
     *
     * @since 1.6.2
     */
    function setupInputMasks() {
      Array.prototype.filter.call(document.getElementsByClassName('masked-phone'), function(item) {
        item.addEventListener( 'blur', function(e) {
          var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
          e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
      });

      if (!$.prototype.inputmask){
          return;
      }

      $form.find('[data-inputmask]').inputmask();
    }

 }
