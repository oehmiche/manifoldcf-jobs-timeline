/*
	jQuery manifoldCfJobsTimeline plugin v0.11
	
	Licensed under the MIT License
	https://opensource.org/licenses/MIT
*/
(function ( $ ) {
 
    $.fn.manifoldCfJobsTimeline = function( options ) {

        var self = $(this);

	    var defaults = {
			jobsEndpoint : options.baseUrl + "/mcf-api-service/json/jobs",
			viewJobUrl : options.baseUrl + "/mcf-crawler-ui/viewjob.jsp?jobid=",
			// simpleTimeline options
			toggle : '',
			barHeight: 25,
			headerHeight: 25,
			fontSize: 16,
			verticalBarSpacing: 5,
			phases: [
				{ start: 0, end: 24, indicatorsEvery: 1, share: 1 }
			],
			formatHeader: function (v) {
				return v;
			}
	    };

	    var settings = $.extend( {}, defaults, options);

		var baseUrl = settings.baseUrl;
		var jobsEndpoint = settings.jobsEndpoint;
		var viewJobUrl = settings.viewJobUrl;

		$.getJSON(jobsEndpoint, function(jobs) {
			var data = [];
			$.each(jobs.job, function(index, job){
				var oneJob = [];
				var schedules = [];
				
				if(!('schedule' in job)) {
					// no schedules found => skip to next job
					return true;
				}
				
				// if there more than one schedule configured, we get an array
				if(job.schedule instanceof Array) {
					schedules = job.schedule;
				} else {
					schedules.push(job.schedule);
				}
				$.each(schedules, function(index, schedule){
					// there is not always a schedule given
					var start = starttime(schedule);
					var end = endtime(start, schedule);
					// use different style for jobs schedules without duration
					var noDuration = (schedule.duration) ? false: true;

					// split a job schedule if it crosses midnight
					if(end <= 24) {
						oneJob.push(createJobEntry(index, job, schedule, start, end, noDuration));
					} else {
						oneJob.push(createJobEntry(index, job, schedule, start, 24, noDuration));
						oneJob.push(createJobEntry(index, job, schedule, 0, end - 24, noDuration));
					}
					oneJob.sort(sortByStartTime);
				})
				data.push(oneJob);
			});
			data.sort(sortArrayByFirstStartTime);
			self.simpleTimeline(settings, data);
		});


		// ** private functions **
		function createJobEntry(index, job, schedule, start, end, noDuration) {
			var css = { "color": "darkblue", "background-color": "lightblue"};
			if(noDuration) 
				css = { "color": "darkblue", "background-color": "lightblue", "border-style": "dotted"}
			return {
				id: job.id + index, 
				label:job.description, 
				start: start, 
				end: end, 
				css: css, 
				popup_html: info_html(job, schedule)
			}
		};
		
		function sortByStartTime(a, b) {
			return ((a.starttime < b.starttime) ? -1 : 1);
		};
		
		function sortArrayByFirstStartTime(jobArray1, jobArray2) {
			return sortByStartTime(jobArray1[0], jobArray2[0]);
		};
		
		function info_html(job, schedule) {
			var html = "<b>" + job.description +"</b><br>"
			+ "Startmode: " + job.start_mode +"<br>"
			+ "Starttime: " + printTime(schedule.hourofday, schedule.minutesofhour) + "<br>" 
			+ "Duration: " + printDurationInMinutes(schedule.duration) + " <br>"
			+ "<a href='" + viewJobUrl+job.id+"' target='_blank'>View Job</a>";
			return html;
		};
		
		function printTime(hour, minutes) {
			var minutesVal = (minutes ? minutes.value : '0');
			var hourVal = (hour ? hour.value : '0');
			return hourVal + ":" + (minutesVal.length == 1 ? '0' : '') + minutesVal;
		};
		
		function printDurationInMinutes(duration) {
			return (duration ? (parseInt(duration) / (1000 * 60)) + " min " : "-");
		};
		
		function starttime(schedule) {
			return (schedule.hourofday ? parseInt(schedule.hourofday.value) : 0) +
				(schedule.minutesofhour ? (parseInt(schedule.minutesofhour.value) / 60) : 0);
		};
		
		function endtime(starttime, schedule) {
			if(schedule.duration) {
				return starttime + (parseInt(schedule.duration) / (1000 * 60 * 60));
			} 
			return starttime + 1;
		};
		
		function bind_popup() {
			var sel_item_id = $('.selected').data('id');
			if(typeof sel_item_id == 'undefined') {
				alert('Ain\'t nothin\' selected, yo!');
				return;
			}
		}; 
    };
 
}( jQuery ));

