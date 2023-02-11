// Определяем переменные Gulp
const {
	src,
	dest,
	watch,
	parallel,
	series
} = require('gulp');


// Подключие модулей
const scss = require('gulp-sass')(require('sass')); // подключаем Sass пакет
const concat = require('gulp-concat'); // подключаем gulp-concat (для конкатенации файлов)
const browserSync = require('browser-sync').create(); // автоматическое обновление страниц
const uglify = require('gulp-uglify'); // сжатие файлов js и библиотек
const autoprefixer = require('gulp-autoprefixer'); // подключаем библиотеку для автоматического добавления префиксов
const imagemin = require('gulp-imagemin'); // оптимизация изображений
// const ghPages = require('gulp-gh-pages'); // выгрузка страницы на github pages
const del = require('del'); // чистка папки dist

const babel = require('gulp-babel');


// Задачи
function styles() { // создаем задачу
	return src('app/scss/style.scss') // путь к расположению файла
		.pipe(scss()) // преобразуем "sass" в css
		.pipe(concat('style.min.css')) // собираем в один файл
		.pipe(autoprefixer({ // создадим префиксы с помощью Autoprefixer
			overrideBrowserslist: ['last 10 version'],
			grid: true
		}))
		.pipe(dest('app/css')) // выгружаем результат в папку app/css
		.pipe(browserSync.stream()) // обновляем страницу
}


function scripts() {
	return src([ // берем все необходимые библиотеки
			'node_modules/jquery/dist/jquery.js', // берем jQuery
			'app/js/main.js' // пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('main.min.js')) // собираем в один файл
		.pipe(uglify()) // сжимаем JavaScript файлы
		.pipe(dest('app/js')) // выгружаем готовый файл в папку app/js
		.pipe(browserSync.stream())
}


function watching() {
	watch(['app/scss/**/*.scss'], styles); // наблюдение за всеми файлами в папке scss
	watch(['app/js/main.js', '!app/js/main.min.js'], scripts); // наблюдение за файлами js. ! - исключение файла
	watch(['app/*.html']).on('change', browserSync.reload); // обновляем html на странице при изменении

}


function browsersync() {
	browserSync.init({ // выполняем browser Sync
		server: { // определяем параметры сервера
			baseDir: 'app/' // указываем папку сервера
		},
		notify: false, // отключаем уведомления
	})
}

function images() {
	return src('app/images/**/*.*') // берём все изображения из папки app
		.pipe(imagemin([ // сжимаем и оптимизируем изображеня
			imagemin.gifsicle({ // сжатие GIF-изображений без потерь
				interlaced: true
			}),
			imagemin.mozjpeg({ // сжатие изображений JPEG с потерями
				quality: 75,
				progressive: true
			}),
			imagemin.optipng({ // сжатие изображений PNG без потерь
				optimizationLevel: 5
			}),
			imagemin.svgo({ // сжатие изображений SVG без потерь
				plugins: [{
						removeViewBox: true
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest('dist/images')) // выгружаем оптимизированные изображения в папку dist/images
}

// function deploy() {
// 	return src('./dist/**/*')
// 	.pipe(ghPages({
// 		remoteUrl: "https://github.com/EMarkova22/balloon_tour.git",
// 		branch: "main"
// 	}))
// };

function cleanDist() {
	return del('dist') // удаляем всё содержимое папки "dist/"
}



// Финальная сбрки проекта gulp build 
function build() {
	return src([ // выбираем нужные файлы
			'app/*.html',
			'app/css/style.min.css',
			'app/js/main.min.js',
			'app/fonts/**/*',

		], {
			base: 'app' // параметр "base" сохраняет структуру проекта при копировании
		})
		.pipe(dest('dist')) // выгружаем в папку с финальной сборкой
}

// Выполнение задач
exports.styles = styles
exports.scripts = scripts;
exports.watching = watching
exports.browsersync = browsersync
exports.images = images
exports.cleanDist = cleanDist
// exports.deploy = deploy

// создаём задачу "build", которая последовательно выполняет нужные операции
exports.build = series(cleanDist, styles, scripts, images, build);

// экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, watching) // задача по умолчанию, в определенной последовательности 

// метод parallel запускает задачи одновременно в любой последовательности
// метод series — выполняет задачи одна за одной в указанном порядке