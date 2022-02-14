$(function(){

	const params = new Proxy(new URLSearchParams(window.location.search), {
  		get: (searchParams, prop) => searchParams.get(prop),
	});

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
		tp: params.tp || 20, 
		tn: params.tn || 1820, 
		fp: params.fp || 180, 
		fn: params.fn || 10,

		p:     function(){return parseInt(this.tp, 10) + parseInt(this.fn, 10)},
		n:     function(){return parseInt(this.fp, 10) + parseInt(this.tn, 10)},

		total: function(){return this.p() + this.n()},

		tp_size: function(){return 6*Math.sqrt(parseInt(this.tp, 10)/this.total())},
		tn_size: function(){return 6*Math.sqrt(parseInt(this.tn, 10)/this.total())},
		fp_size: function(){return 6*Math.sqrt(parseInt(this.fp, 10)/this.total())},
		fn_size: function(){return 6*Math.sqrt(parseInt(this.fn, 10)/this.total())},


		predp: function(){return parseInt(this.fp, 10) + parseInt(this.tp, 10)},
		predn: function(){return parseInt(this.fn, 10) + parseInt(this.tn, 10)},

		prevalence:  function(){return this.p() / (this.total() )},
		
		sensitivity: function(){return parseInt(this.tp, 10) / this.p()},
		specificity: function(){return parseInt(this.tn, 10) / this.n()},

		informedness: function(){return this.sensitivity() + this.specificity() - 1},

		positive_predictive_value: function(){return parseInt(this.tp, 10) / this.predp()},
		negative_predictive_value: function(){return parseInt(this.tn, 10) / this.predn()},

		markedness: function(){return this.positive_predictive_value() + this.negative_predictive_value() - 1},


		/* A bit of a hack */
		matthews_cc_sign: function(){return (this.markedness() < 0 | this.informedness() < 0) ? -1 : 1},
		matthews_cc: function(){return this.matthews_cc_sign() * Math.sqrt(this.markedness() * this.informedness())},

		false_positive_rate: function(){return parseInt(this.fp, 10)/this.n()},
		false_negative_rate: function(){return parseInt(this.fn, 10)/this.p()},

		false_discovery_rate: function(){return parseInt(this.fp, 10)/this.predp()},
		false_omission_rate:  function(){return parseInt(this.fn, 10)/this.predn()},

		accuracy: function(){return( (parseInt(this.tp, 10) + parseInt(this.tn, 10)) / (this.total()) )},
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

		var tp = parseInt(confusion_matrix_model.tp, 10);
		var fn = parseInt(confusion_matrix_model.fn, 10);

		var tn = parseInt(confusion_matrix_model.tn, 10);
		var fp = parseInt(confusion_matrix_model.fp, 10);
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