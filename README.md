## Website Performance Optimization portfolio project

As part of Udacity Nanodegree Front-End Web Developer, I have done the following changes to the original project to be 
able to score > 90 points on the PageSpeed tool by Google.

### For the whole site

1. Create a copy of most folders named <folder_name>_orig or index_orig.html, to be use during the automated build process. 
1. Create Gruntfile.js file in order to automate the process of minimize image sizes, uglify (compact) javascript files, 
   and minimize html by using the following Grunt plugins: grunt-contrib-imagemin, grunt-contrib-htmlmin and grunt-contrib-uglify.
1. We had to minimize manually a large jpg file (views/images/pizzeria.jpg) that for some reason was not possible to 
   do with grunt-contrib-iimagemin
1. Move render-blocking javascript sections to be executed at the end of the HTML file

### For the Entry page (index.html)

1. To further improve the score I actually move all css content that was not too much and embedded it into the html page.
   This is not a good idea for a larger site and/or larger css. My first thought was to inline just the few elements
   needed for the main page, but as the CSS was not that large I embedded it all.

### For the Pizza Page (/views/pizza.html)

1. Change CSS file style.css by moving the style information in .randomPizzaContainer and moving it to its parent and using
   flexbox that seems to perform better than floats

            /* change this class to use flexbox define on parent as that would speed up the rendering
             */
            .randomPizzaContainer {
            }
            
            
            /* using flexbox on parent of randomPizzaContainer to speed up rendering
            */
            #randomPizzas{
              flex: 1 1;
              display: flex;
              justify-content: space-around;
              flex-flow: row wrap;
            }

1. Different changes on views/js/main.js:
       
    -  Added an onresize event hook to keep track of the viewport size so that we don't try to draw/move pizza elements
    that are out of sight. Also added a function to calculate the viewport size and a global variable VIEWPORT_HEIGHT 
    to store the height. Also added a helper function to set the top of the pizza elements and the visibility. Also
    refactor some of the constant values to constant parameters (NUM_ELEMENTS, NUM_COLUMNS and VERTICAL_PIZZA_SEPARATION).
    We are not doing the same on the horizontal direction but it could be done to improve it further
    specially for mobile views, but the vertical one was the most under performant.
    
            /**
             * Function to get ViewPort Height out of stackoverflow (http://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript)
             * @returns {number}
             */
            function getViewPortHeight(){
                return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            }
            
            var VIEWPORT_HEIGHT = getViewPortHeight();
            
            
            /** DRY function to be used on DOMContentLoaded and onresize events to set the top of the pizzas and the visibility
             * 
             * @param elem
             * @param i
             */
            function setTopVisibility(elem, i){
                var top = (Math.floor(i / NUM_COLUMNS) * VERTICAL_PIZZA_SEPARATION);
                elem.style.top = top + 'px';
                // if it is outside viewport, display is none
                elem.style.display = (top > VIEWPORT_HEIGHT) ? 'none':'block';
            }
            
            /**
             * We have change this function to only display elements that are visible on the viewport
             */
            // Generates the sliding pizzas when the page loads.
            document.addEventListener('DOMContentLoaded', function() {
            
              for (var i = 0; i < NUM_ELEMENTS; i++) {
                ...
                setTopVisibility(elem, i);
                document.querySelector("#movingPizzas1").appendChild(elem);
              }
              updatePositions();
            });
            
            /**
             * onresize event hook to keep track of viewport size so we can display or not certain pizza elements that will not be shown
             * and would consume time on the updatePositions method unnecessarily
             *
             * @param event
             */
            window.onresize = function(event){
                VIEWPORT_HEIGHT = getViewPortHeight();
                var items = document.querySelectorAll('.mover');
                for (var i = 0; i < items.length; i++)
                    setTopVisibility(items[i], i);
            };

    -  Function UpdatePosition was changed to avoid querying all elements inside the loop and also draw only elements 
        visible inside the viewport and get out of the loop if the following elements are not visible:
    
            /**
             * I have change this function to only handle pizza elements that are visible on the viewport.
             * Also move querySelectorAll to a single evaluation
             */
            // The following code for sliding background pizzas was pulled from Ilya's demo found at:
            // https://www.igvita.com/slides/2012/devtools-tips-and-tricks/jank-demo.html
            // Moves the sliding background pizzas based on scroll position
            function updatePositions() {
              frame++;
              window.performance.mark("mark_start_frame");
            
              var items = document.querySelectorAll('.mover');
              for (var i = 0; i < items.length; i++) {
                  if (items[i].style.display == 'none')
                    break;
                var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
                items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
              }
    -  We change function changePizzaSizes to make it into a set of batch processes. Where only a set of images are change
     at a time to make the render engine appear to work faster to the person changing the slider.
     
            function changePizzaSizesBatch(size, start, batch_size, pizzaContainer, width) {
                for (var i = start; i < pizzaContainer.length; i++) {
                    if (i - start > batch_size) {
                        batchTimeouts.push(setTimeout(function() {
                            changePizzaSizesBatch(size, start + batch_size, batch_size, pizzaContainer, width);
                        }, BATCH_TIMEOUT));
                        return;
                    }
                    pizzaContainer[i].style.width = width;
                }
            }
        
            /**
             * Change this function to make it as a batch process sized BATCH_SIZE, so we will only process one batch of pizzas at a time,
             * wait BATCH_TIMEOUT and process next batch. Also added functionality to stop any future batch in case this function is call again.
             *
             * @param size
             */
          // Iterates through pizza elements on the page and changes their widths
            function changePizzaSizes(size) {
                var pizzaContainer = document.querySelectorAll(".randomPizzaContainer");
                var dx = determineDx(pizzaContainer[0], size);
                var newWidth = (pizzaContainer[0].offsetWidth + dx) + 'px';
                batchTimeouts.forEach(clearTimeout);
                batchTimeouts = [];
                changePizzaSizesBatch(size, 0, BATCH_SIZE, pizzaContainer, newWidth);
            }
          