$(function(){

	const params = new Proxy(new URLSearchParams(window.location.search), {
  		get: (searchParams, prop) => searchParams.get(prop),
	});



	tinybind.formatters.percent = function(value){
	  return "" + (value * 100).toFixed(1) + "%";
	}

	tinybind.bind(document.getElementById('body'), 
		{
			tp: params.tp || 20, 
			tn: params.tn || 1820, 
			fp: params.fp || 180, 
			fn: params.fn || 10,

			p:     function(){return parseInt(this.tp, 10) + parseInt(this.fn, 10)},
			n:     function(){return parseInt(this.fp, 10) + parseInt(this.tn, 10)},

			total: function(){return this.p() + this.n()},

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

			show_false_x_rate_complements: true,
			show_misc_summary_metrics: true

		})	

	$('input').change(function(e){
	    var queryParams = new URLSearchParams(window.location.search);
	    queryParams.set($(this).attr('name'), $(this).val());
	    history.replaceState(null, null, "?"+queryParams.toString());
	})




	var classes_of_interest = ['tp', 'tn', 'fp', 'fn', 'p', 'n', 'predp', 'predn'];

	classes_of_interest.forEach(function(c){
		$("."+c+" input").addClass(c);


		$("."+c).mouseover(function(e){
			$('#table_confusion_matrix .'+c).addClass('highlight');
		});

		$("."+c).mouseout(function(e){
			$('#table_confusion_matrix .'+c).removeClass('highlight');
		});

	})

})