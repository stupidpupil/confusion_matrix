$(function(){

	const params = new Proxy(new URLSearchParams(window.location.search), {
  		get: (searchParams, prop) => searchParams.get(prop),
	});


	tinybind.formatters.integer = {
		read: function(value) {
			return parseInt(value, 10);
		},

		publish: function(value){
			return parseInt(value, 10);
		}

	}

	tinybind.formatters.percent = function(value){
	  return "" + (value * 100).toFixed(1) + "%";
	}

	tinybind.formatters.percent_no_small_digits = function(value){
	  return "" + (value * 100).toFixed(0) + "%";
	}

	tinybind.binders.square_size_rem = function(el, val){

		if(isNaN(val)){
			val = 0;
		}

		el.style.height = val + 'rem';
		el.style.width = val + 'rem';
	}

	confusion_matrix_model = {
		tp: parseInt(params.tp, 10) || 20, 
		tn: parseInt(params.tn, 10) || 1820, 
		fp: parseInt(params.fp, 10) || 180, 
		fn: parseInt(params.fn, 10) || 10,

		p:     function(){return this.tp + this.fn },
		n:     function(){return this.fp + this.tn },

		total: function(){return this.p() + this.n()},

		tp_size: function(){return 6*Math.sqrt(this.tp/this.total())},
		tn_size: function(){return 6*Math.sqrt(this.tn/this.total())},
		fp_size: function(){return 6*Math.sqrt(this.fp/this.total())},
		fn_size: function(){return 6*Math.sqrt(this.fn/this.total())},


		predp: function(){return this.fp + this.tp},
		predn: function(){return this.fn + this.tn},

		prevalence:  function(){return this.p() / (this.total() )},
		
		sensitivity: function(){return this.tp / this.p()},
		specificity: function(){return this.tn / this.n()},

		informedness: function(){return this.sensitivity() + this.specificity() - 1},

		positive_predictive_value: function(){return this.tp / this.predp()},
		negative_predictive_value: function(){return this.tn / this.predn()},

		markedness: function(){return this.positive_predictive_value() + this.negative_predictive_value() - 1},


		/* A bit of a hack */
		matthews_cc_sign: function(){return (this.markedness() < 0 | this.informedness() < 0) ? -1 : 1},
		matthews_cc: function(){return this.matthews_cc_sign() * Math.sqrt(this.markedness() * this.informedness())},

		false_positive_rate: function(){return this.fp/this.n()},
		false_negative_rate: function(){return this.fn/this.p()},

		false_discovery_rate: function(){return this.fp/this.predp()},
		false_omission_rate:  function(){return this.fn/this.predn()},

		accuracy: function(){return( (this.tp + this.tn) / (this.total()) )},
		f1_score: function(){return (2*this.positive_predictive_value()*this.sensitivity())/(this.positive_predictive_value() + this.sensitivity())},

		show_false_x_rate_complements: false,
		show_misc_summary_metrics: false,
		show_scale_blobs: true

	};

	get_gcd = function(a, b){

		if (b > a){
			var old_a = a;
			a = b;
			b = old_a;
		}

		if (b == 0){
			return Math.max(a, 1);
		}

		var rem = a % b;

		if (rem == 0){
			return(b);
		}


		return(get_gcd(b, rem));

	}

	set_prevalence_close_to = function(target_prev){

		if(target_prev >= 1.0){
			target_prev = 0.9999;
		}

		var tp = confusion_matrix_model.tp;
		var fn = confusion_matrix_model.fn;

		var tn = confusion_matrix_model.tn;
		var fp = confusion_matrix_model.fp;
		var neg = tn + fp;


		var gcd = get_gcd(Math.abs(tp), Math.abs(fn));

		var target_pos = (target_prev * neg) / (1.0 - target_prev);


		var multiplier = Math.round(target_pos/((tp+fn)/gcd));

		if(multiplier == 0){
			multiplier = 1;
		}

		console.log((tp+fn)/gcd);

		confusion_matrix_model.tp = multiplier * tp/gcd;
		confusion_matrix_model.fn = multiplier * fn/gcd;
	}


	tinybind.bind(document.getElementById('body'), confusion_matrix_model)	

	$('.table_confusion_matrix input').change(function(e){
	    var queryParams = new URLSearchParams(window.location.search);
	    queryParams.set($(this).attr('name'), $(this).val());
	    history.replaceState(null, null, "?"+queryParams.toString());
	})


	var classes_of_interest = ['tp', 'tn', 'fp', 'fn', 'p', 'n', 'predp', 'predn'];

	classes_of_interest.forEach(function(c){
		$("."+c+" input").addClass(c);


		$("."+c).mouseover(function(e){
			$('.table_confusion_matrix .'+c).addClass('highlight');
		});

		$("."+c).mouseout(function(e){
			$('.table_confusion_matrix .'+c).removeClass('highlight');
		});

	})

})