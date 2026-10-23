// Presentation metadata only: source keys and values remain unchanged for saved funnels.
const words = {
  temperature:'Температурные пороги',minCoolingTemperature:'Минимальная температура охлаждения',
  overheatTemperature:'Температура перегрева',overheatWarningTemperature:'Предупреждение о перегреве',
  overheatRecoveryTemperature:'Температура восстановления после перегрева',
  misfireMinTemperature:'Температура начала сбоев',misfireMaxTemperature:'Верхний температурный порог сбоев',
  hidden:'Скрытая запись',retired:'Архивная запись',catalogued:'Запись в каталоге',
  slot:'Крепление',name:'Название',longName:'Полное название',code:'Код',manufacturer:'Производитель',
  category:'Категория',type:'Тип',subType:'Подтип',types:'Допустимые типы',grade:'Класс',size:'Размер',
  minSize:'Минимальный размер',maxSize:'Максимальный размер',requiredTags:'Обязательные теги',tags:'Теги',
  scKey:'Внутренний ключ',scRef:'Внутренняя ссылка',slug:'Идентификатор адреса',
  createdAt:'Дата создания записи',updatedAt:'Дата обновления записи',count:'Количество',
  typeData:'Параметры',durability:'Прочность компонента',health:'Прочность',maxHealth:'Максимальная прочность',mass:'Масса',
  powerRanges:'Режимы питания',low:'Низкий',medium:'Средний',high:'Высокий',start:'Начало диапазона',modifier:'Множитель',
  signatureEm:'Электромагнитная сигнатура',signatureIr:'Инфракрасная сигнатура',
  thrusterType:'Тип двигателя',thrusterClass:'Класс двигателя',thrustCapacity:'Максимальная тяга',
  fuelBurnScuPer10KNewton:'Расход топлива на 10 кН (SCU)',fuelBurnRatePer10KNewton:'Коэффициент расхода топлива на 10 кН',
  resistances:'Сопротивление урону',physical:'Физический',energy:'Энергетический',distortion:'Дисторсионный',thermal:'Тепловой',biochemical:'Биохимический',stun:'Оглушение',
  selfRepair:'Самовосстановление',time:'Время',healthRatio:'Доля прочности',maxRepairs:'Лимит восстановлений',
  availability:'Магазины',boughtAt:'Покупка',soldAt:'Продажа',rentalAt:'Аренда',shop:'Магазин',location:'Местоположение',
  price:'Цена',priceType:'Тип цены',parentName:'Родительское местоположение',kind:'Вид',itemType:'Тип предмета',
  vtolOnly:'Только вертикальный взлёт',gimbal:'Отклонение двигателя',maxYaw:'Максимальное рыскание',minYaw:'Минимальное рыскание',maxPitch:'Максимальный тангаж',minPitch:'Минимальный тангаж',
  metrics:'Габариты и корпус',hullHealth:'Прочность корпуса',hullParts:'Части корпуса',hullDoors:'Двери корпуса',
  length:'Длина',beam:'Ширина',height:'Высота',width:'Ширина',dimensions:'Габариты',volume:'Объём',
  speeds:'Полёт',scmSpeed:'Скорость SCM',maxSpeed:'Максимальная скорость',pitch:'Тангаж',yaw:'Рыскание',roll:'Крен',
  crew:'Экипаж',min:'Минимум',max:'Максимум',value:'Значение',capacity:'Вместимость',cargo:'Груз',
  cargoHolds:'Грузовые отсеки',maxCargo:'Максимальный груз',maxContainerSize:'Максимальный контейнер',
  isGroundVehicle:'Наземная техника',hydrogenFuelTankSize:'Вместимость водородных баков',quantumFuelTankSize:'Вместимость квантовых баков',
  weaponRacks:'Оружейные стойки',storageContainers:'Контейнеры',positions:'Позиции экипажа',
  damagePerShot:'Урон за выстрел',fireRate:'Скорострельность',range:'Дальность',speed:'Скорость',
  powerConsumption:'Потребление энергии',powerBase:'Выработка энергии',maxRegen:'Восстановление',
  driveSpeed:'Квантовая скорость',spoolUpTime:'Разогрев',quantumFuelConsumption:'Расход квантового топлива',
  damagePerSecond:'Урон в секунду',ammo:'Боезапас',ammoCount:'Количество боеприпасов',
  deflectionEnergy:'Deflection · Энергетический',deflectionPhysical:'Deflection · Физический',
  deflectionThermal:'Deflection · Тепловой',deflectionDistortion:'Deflection · Дисторсионный',
  afterburner_speed:'Скорость на форсаже',cargocapacity:'Грузовместимость',max_crew:'Максимальный экипаж',min_crew:'Минимальный экипаж',
  pitch_max:'Максимальный тангаж',yaw_max:'Максимальное рыскание',roll_max:'Максимальный крен',scm_speed:'Скорость SCM',
  production_status:'Готовность',production_note:'Примечание о разработке',focus:'Назначение',
  xaxis_acceleration:'Ускорение по оси X',yaxis_acceleration:'Ускорение по оси Y',zaxis_acceleration:'Ускорение по оси Z',
  compiled:'Компоненты',RSIAvionic:'Авионика',RSIPropulsion:'Двигательная система',RSIThruster:'Двигатели',RSIModular:'Системные модули',RSIWeapon:'Вооружение',
  radar:'Радар',computers:'Бортовые компьютеры',fuel_tanks:'Топливные баки',quantum_drives:'Квантовые двигатели',jump_modules:'Прыжковые модули',
  quantum_fuel_tanks:'Квантовые баки',main_thrusters:'Основные двигатели',maneuvering_thrusters:'Маневровые двигатели',
  power_plants:'Силовые установки',coolers:'Охладители',shield_generators:'Генераторы щитов',life_support:'Жизнеобеспечение',
  weapons:'Орудия',turrets:'Турели',missiles:'Ракеты',utility_items:'Вспомогательное оборудование',fuel_intakes:'Воздухозаборники',
  mounts:'Количество креплений',quantity:'Количество компонентов',component_size:'Размер компонента по матрице',component_class:'Внутренняя группа оборудования',
  details:'Примечание',loadout:'Комплектация',ammo_name:'Название боеприпаса',known_for:'Известные модели',
  chassis_id:'Идентификатор шасси',manufacturer_id:'Идентификатор производителя',url:'Адрес страницы',time_modified:'Дата изменения',unfiltered:'Исходное значение',
  inGame:'Есть в игре',classification:'Классификация',onSale:'В продаже',playerOwnable:'Доступен игрокам',ingameOnly:'Только в игре',canLandOnPlanets:'Посадка на планеты',
  pledgePrice:'Цена pledge',productionStatus:'Готовность',rsiName:'Название в RSI',
};
const equipment={QuantumDrive:'Квантовые двигатели',JumpDrive:'Прыжковые модули',ManneuverThruster:'Маневровые двигатели',Turret:'Турели / подвесы',WeaponGun:'Корабельные орудия',
 CommsController:'Управление связью',DoorController:'Управление дверями',EnergyController:'Управление питанием',ShieldController:'Управление щитами',WeaponController:'Управление оружием',
 Cooler:'Охладители',FuelIntake:'Воздухозаборники',FuelTank:'Водородные баки',QuantumFuelTank:'Квантовые баки',Radar:'Радар',Seat:'Кресла',SelfDestruct:'Самоуничтожение',MainThruster:'Основные двигатели',CargoGrid:'Грузовые сетки',
 MissileController:'Управление ракетами',CapacitorAssignmentController:'Распределение конденсаторов',Relay:'Реле',WeaponDefensive:'Контрмеры',Armor:'Броня',LifeSupportGenerator:'Жизнеобеспечение',CoolerController:'Управление охлаждением',FlightController:'Управление полётом',PowerPlant:'Силовые установки',Shield:'Щиты',MissileLauncher:'Ракетные установки',Missile:'Ракеты',FuelController:'Управление топливом',
 Paints:'Окраски',Misc:'Прочее оборудование',SalvageController:'Управление утилизацией',TractorBeam:'Тракторные лучи',SeatDashboard:'Приборные панели',TurretBase:'Основания турелей',BombLauncher:'Бомбовые установки',Bomb:'Бомбы',Cargo:'Груз',Door:'Двери',Module:'Модули',WeaponMining:'Горнодобывающее оборудование',MiningController:'Управление добычей',EMP:'Генераторы ЭМИ',GroundVehicleMissileLauncher:'Наземные ракетные установки',WheeledController:'Управление колёсами',doors:'Двери',utility:'Вспомогательное оборудование',QuantumInterdictionGenerator:'Генераторы квантового перехвата',TargetSelector:'Выбор целей',SalvageInternalStorage:'Хранилища утилизации',SalvageFillerStation:'Станции заполнения при утилизации',ToolArm:'Манипуляторы',SalvageFieldEmitter:'Излучатели поля утилизации',SalvageHead:'Головки утилизации',SalvageModifier:'Модификаторы утилизации',Container:'Контейнеры',UtilityTurret:'Вспомогательные турели',AttachedPart:'Прикреплённые детали',TowingBeam:'Буксировочные лучи',ExternalFuelTank:'Внешние топливные баки',DockingCollar:'Стыковочные узлы',SalvageFieldSupporter:'Поддержка поля утилизации'};
const internal = /(?:^|\.)(?:hidden|retired|catalogued|scKey|scRef|tags|tags\[\]|requiredTags|requiredTags\[\]|slug|createdAt|updatedAt|longName|code)(?:\.|$)|\.slot\.(?:name|category|types)(?:\[\])?(?:\.|$)/;
const engineering = /\.(?:temperature|powerRanges|resistances|selfRepair|gimbal)(?:\.|$)/;
export function presentField(field) {
  const parts=field.key.split('.').map(part=>part.replace(/\[\]/g,''));
  if(parts.length===1)return {...field,level:'standard'};
  // Reuse existing translated group names, including for count fields.
  let group=field.group.replace(/\[\]/g,'');
  const original=field.label.split(' › ').map(s=>s.replace(/ \[список\]|\[\]/g,''));
  const labels=parts.slice(1).map((part,i)=>words[part]||equipment[part]||(original.length===parts.length-1?original[i]:part));
  const rootName=words[parts[1]]||equipment[parts[1]];
  if(rootName)group=(parts[0]==='game'?'Игровое оборудование':parts[0]==='fy'?'FleetYards':'RSI')+' · '+rootName;
  let label=labels.length>1?labels.slice(1).filter(s=>s!=='Параметры').join(' · '):labels[0];
  if(parts.at(-1)==='count')label=labels.length===2?'Количество':labels.slice(1,-1).join(' · ')+' · количество';
  const rsiComponent=parts[0]==='rsi'&&parts[1]==='compiled';
  if(rsiComponent){group='RSI · '+(words[parts[3]]||parts[3]);label=parts.slice(4).map(part=>words[part]||part).join(' · ');if(parts.at(-1)==='count')label='Число записей оборудования'}
  const unresolved=/[a-z]{3}|\[\]|_/.test((label+' '+group.replace(/FleetYards|RSI/g,'')).replace(/SCU|SCM|HP|USD|aUEC|pledge|Deflection/g,''));
  const technical=field.technical||internal.test(field.key)||unresolved||parts.at(-1)==='url'||rsiComponent&&['type','component_class','count','loadout'].includes(parts.at(-1));
  const advanced=engineering.test(field.key)||rsiComponent||/^game\.[^.]+\.(availability|category|type|subType)(\.|$)/.test(field.key);
  // Never guess units for opaque source fields (including temperature thresholds).
  let unit=field.unit;
  if(!unit&&/^fy\.metrics\.(length|beam|height)$/.test(field.key))unit='м';
  if(!unit&&/^fy\.metrics\.mass$/.test(field.key))unit='кг';
  if(!unit&&/^fy\.metrics\.hullHealth$/.test(field.key))unit='HP';
  if(!unit&&/^fy\.speeds\.(scmSpeed|maxSpeed)$/.test(field.key))unit='м/с';
  return {...field,label,group,unit,technical,level:technical?'technical':advanced?'advanced':'standard',
    note:field.key.includes('.temperature.')?'Порог из данных компонента. Единица измерения в источнике не указана.':undefined};
}
export const fieldVisible=(field,scope)=>scope==='technical'||(!field.technical&&(scope==='advanced'||field.level==='standard'));
