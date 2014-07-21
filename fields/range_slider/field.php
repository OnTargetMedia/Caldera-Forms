<?php
$polyfill = 'false';
if(!empty($field['config']['pollyfill'])){
	$polyfill = 'true';
}
?><div class="<?php echo $field_wrapper_class; ?>">
	<?php echo $field_label; ?>
	<div class="<?php echo $field_input_class; ?>">
		<div style="position: relative;" <?php if(!empty($field['config']['showval'])){ ?>class="row"<?php } ?>>
			<?php if(!empty($field['config']['showval'])){ ?><div class="col-xs-9" style="margin: <?php if(!empty($field['config']['pollyfill'])){ echo '2px'; }else{ echo '8px'; } ?> 0px;"><?php }else{ ?><div style="margin: <?php if(!empty($field['config']['pollyfill'])){ echo '6px'; }else{ echo '12px'; } ?> 0px;"><?php } ?>
				<input id="<?php echo $field_id; ?>" type="range" data-handle="<?php echo $field['config']['handle']; ?>" data-trackcolor="<?php echo $field['config']['trackcolor']; ?>" data-handleborder="<?php echo $field['config']['handleborder']; ?>" data-color="<?php echo $field['config']['color']; ?>" data-field="<?php echo $field_base_id; ?>" name="<?php echo $field_name; ?>" value="<?php echo $field_value; ?>" min="<?php echo $field['config']['min']; ?>" max="<?php echo $field['config']['max']; ?>" step="<?php echo $field['config']['step']; ?>" <?php echo $field_required; ?>>
			</div>
			<?php if(!empty($field['config']['showval'])){ ?><div class="col-xs-3"><?php if(!empty($field['config']['prefix'])){echo $field['config']['prefix']; } ?><span id="<?php echo $field_id; ?>_value"><?php echo $field_value; ?></span><?php if(!empty($field['config']['suffix'])){echo $field['config']['suffix']; } ?></div><?php } ?>
		</div>
		<?php echo $field_caption; ?>
	</div>
</div>
<script type="text/javascript">
	jQuery(function($){

		function init_rangeslider(){
			var el = $('#<?php echo $field_id; ?>'),
				rangeslider;
			<?php if(empty($field['config']['pollyfill'])){ ?>
			if (el.is(':visible')) {
				rangeslider = el.rangeslider({
					onSlide: function(position, value) {
						$('#<?php echo $field_id; ?>_value').html(value);
					},
					polyfill: <?php echo $polyfill; ?>
				});
				rangeslider.parent().find('.rangeslider').css('backgroundColor', rangeslider.data('trackcolor'));
				rangeslider.parent().find('.rangeslider__fill').css('backgroundColor', rangeslider.data('color'));
				rangeslider.parent().find('.rangeslider__handle').css('backgroundColor', rangeslider.data('handle')).css('borderColor', rangeslider.data('handleborder'));
			}else{
				el.rangeslider('destroy');
			}
			<?php }else{ ?>
			// pollyfill support
			el.on('change', function(){
				$('#<?php echo $field_id; ?>_value').html(this.value);
			}).css("width", "100%");
			<?php } ?>
		}
		<?php if(empty($field['config']['pollyfill'])){ ?>
		// setup tabs
		$(document).on('cf.pagenav', function(){
			init_rangeslider();
		});
		<?php } ?>
		// init slider
		init_rangeslider();

	});
</script>