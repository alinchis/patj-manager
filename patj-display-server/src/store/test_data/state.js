export default {
  'user_profile': {
    'id': 0,
    'name_ro': 'Alin'
  },
  'current_selection': {
    'county_index': '',
    'county_code_auto': '',
    'county_name_ro': '',
    'uat_index': '',
    'uat_siruta': '',
    'uat_name_ro': '',
  },
  'counties': [
    {
      'id': 1,
      'code_siruta': '332',
      'name_en': 'Suceava',
      'name_ro': 'Suceava',
      'code_auto': 'SV',
      'area_km2': 8553,
      'main_uat_siruta': '146263',
      'mair_uat_name_en': 'Suceava',
      'main_uat_name_ro': 'Suceava',
      'logo': '/RO_judet_stema/RO_stema_SV.png',
      'uat': [
        {
            'code_siruta': '11',
            'name_ro': 'localitate A',
            'name_en': 'localitate A',
            'profile': {
                'description': {
                    'label': 'Date de identificare',
                    'name_ro': {'label': 'Denumire', 'value': 'localitatea A'},
                    'name_en': {'label': 'Denumire (EN)', 'value': 'localitatea A'},
                    'area': {'label': 'Suprafata (km2)', 'value': 5555},
                    'population': {'label': 'Populaţie totală stabiă (1980)', 'value': 5432},
                    'main_locality': {'label': 'Localitatea reşedintă', 'value': 'localitatea A'},
                    'vilages_names': {'label': 'Denumiri', 'value': ['localitatea AA', 'localitatea AAA']},
                    'vilages_number': {'label': 'Număr localităţi', 'value': 2},
                    'code_siruta': {'label': 'Cod SIRUTA', 'value': '11'},
                    'code_postal': {'label': 'Cod poştal', 'value': '717005'},
                    'map': ''
                },
                'location': {
                    'label': 'Localizare geografică',
                    'position': {'label': 'Poziţie (în judeţ)', 'value': 'sud-est'},
                    'coordonates': {
                        'label': 'Coordonate geografice',
                        'value': {
                            'lat': {'label': 'Latitudine nordică', 'value': 47.83},
                            'lon': {'label': 'Longitudine estică', 'value': 22.06}
                        }
                    },
                    'altitude': {'label': 'Altitudine medie', 'value': 150},
                    'neighbors': {'label': 'Vecini', 'value': [{'nord-est': 'localitatea ABA'}, {'sud-vest': 'localitatea ACA'}]}

                },
                'landscape': {
                    'label': 'Cadru natural şi peisaj',
                    'features': {'label': 'Caracteristici ale peisajului', 'value': 'peisaj de campie ...'},
                    'water': {
                        'label': 'Ape de suprafată',
                        'value': {
                            'rivers': {'label': 'Râuri', 'value': ['raul 1', 'raul 2', 'raul 3']},
                            'lakes': {
                                'natural': {'label': 'Lacuri naturale', 'value': []},
                                'artificial': {'label': 'Lacuri artificiale', 'value': []}
                            }
                        }
                    },
                    'vegetation': {
                        'label': 'Vegetatie',
                        'forests': {'label': 'Păduri', 'value': []},
                        'species': {'label': 'Specii', 'value': []}
                    },
                    'fauna': {
                        'label': 'Faună',
                        'species': {'label': 'Specii', 'value': []},
                        'migration': {'label': 'Culoare de migraţie', 'value': []}
                    },
                    'soil': {
                        'label': 'Caracteristici ale solului',
                        'types': {'label': 'Tipuri de sol', 'value': ['cernoziomuri cambrice', 'tipice', 'de planta', 'vertice']}
                    },
                    'underground': {
                        'label': 'Resurse de subsol',
                        'value': []
                    },
                    'protected_areas': {
                        'label': 'Zone protejate',
                        'types': {
                            'rospa': {
                                'label': 'ROSPA',
                                'value': [
                                    {'name_ro': '', 'area': 10}
                                ]
                            },
                            'other': {
                                'label': 'Alte rezervaţii',
                                'value': [
                                    {'name_ro': '', 'area': 5}
                                ]
                            }
                        }
                    },
                    'damaged_landscapes': {
                        'label': 'Peisaje degradate',
                        'types': {}
                    },
                    'cultural_landscapes': {
                        'label': 'Peisaje culturale',
                        'types': {}
                    },
                    'lucas': {}
                },
                'accessibility': {
                    'label': 'Accesibilitate',
                    'types': {
                        'roads': {
                            'label': 'Rutieră',
                            'list': {
                                'DN': [],
                                'DJ': [],
                                'DC': []
                            },
                            'distance_to_main': {
                                'label': 'Distanţa între oraş /sat reşedintă şi municipiul reşedintă de judeţ',
                                'main': {
                                    'name_ro': '',
                                    'name_en': '',
                                    'code_siruta': ''
                                },
                                'distance': {'label': 'Distanta', 'value': 50, 'unit': 'km'},
                                'time': {'label': 'Timp', 'value': 40, 'unit': 'min'},
                                'aknoledgement': 'Tehnologia utilizată'
                            },
                            'distance_to_city': {
                                'label': 'Distanţa între oraş /sat reşedintă şi cel mai apropiat oraş',
                                'city': {
                                    'name_ro': '',
                                    'name_en': '',
                                    'code_siruta': ''
                                },
                                'distance': {'label': 'Distanta', 'value': 60, 'unit': 'km'},
                                'time': {'label': 'Timp', 'value': 45, 'unit': 'min'},
                                'notes': 'Tehnologia utilizată'
                            },
                            'connections': {
                                'label': 'Conectare la sisteme de transport public inter-urban',
                                'value': []
                            },
                            'border': {
                                'label': 'Puncte de trecere a frontierei',
                                'list': {}
                            }
                        },
                        'railroads': {'label': 'Feroviară', 'value': []},
                        'aerial': {
                            'label': 'Aeriană',
                            'airports': [
                                {
                                    'name_ro': '',
                                    'name_en': '',
                                    'city': {
                                        'name_ro': '',
                                        'name_en': '',
                                        'code_siruta': '',
                                        'county': {
                                            'name_ro': '',
                                            'name_en': '',
                                            'code_siruta': ''
                                        }
                                    },
                                    'distance': {'label': 'Distanta', 'value': 60, 'unit': 'km'},
                                    'time': {'label': 'Timp', 'value': 45, 'unit': 'min'},
                                    'notes': 'Tehnologia utilizată'
                                }
                            ]
                        },
                        'water': {'label': 'Maritimă şi fluvială', 'value': []}
                    }
                },
                'history': {
                    'label': 'Aspecte istorice',
                    'uat': {
                        'label': 'UAT',
                        'name_current': {'label': 'Denumire actuală', 'value': 'Localitate A'},
                        'name_old': {'label': 'Denumiri vechi', 'value': []},
                        'first': {
                            'label': 'Atestare documentară',
                            'value': {
                                'year': {'label': 'Anul', 'value': 1500},
                                'document': {'label': 'Documentul', 'value': ''},
                                'author': {'label': 'Autorul', 'value': ''},
                                'source': {'label': 'Sursa', 'value': {}}
                            }
                        }
                    },
                    'localities': {
                        'label': 'Localitaţi',
                        'value': [
                            {
                                'name_current': {'label': 'Denumire actuală', 'value': 'Localitate AA'},
                                'name_old': {'label': 'Denumiri vechi', 'value': []},
                                'first': {
                                    'label': 'Atestare documentară',
                                    'value': {
                                        'year': {'label': 'Anul', 'value': 1550},
                                        'document': {'label': 'Documentul', 'value': ''},
                                        'author': {'label': 'Autorul', 'value': ''},
                                        'source': {'label': 'Sursa', 'value': {}}
                                    }
                                }
                            },
                            {
                                'name_current': {'label': 'Denumire actuală', 'value': 'Localitate AAA'},
                                'name_old': {'label': 'Denumiri vechi', 'value': []},
                                'first': {
                                    'label': 'Atestare documentară',
                                    'value': {
                                        'year': {'label': 'Anul', 'value': 1650},
                                        'document': {'label': 'Documentul', 'value': ''},
                                        'author': {'label': 'Autorul', 'value': ''},
                                        'source': {'label': 'Sursa', 'value': {}}
                                    }
                                }
                            }
                        ]
                    }
                },
                'territory': {
                    'label': 'Teritoriu administrativ',
                    'area': {
                        'total': {'label': 'Suprafaţa totală', 'value': 8888, 'unit': 'ha'},
                        'percent': {'label': 'Procent din suprafaţa judeţului', 'value': 37.8, 'unit': '%'}
                    },
                    'balance': {
                        'label': 'Bilanţ teritorial',
                        'table': {
                            'header': []
                        }
                    }
                },
                'urbanism': {},
                'population': {},
                'economy': {},
                'facilities': {},
                'utilities': {},
                'environment': {},
                'risks': {},
                'investments': {},
                'budget': {},
                'plans': {},
                'diagnosis': {},
                'recommendations': {}
            }
        },
        {'code_siruta': '12', 'name_ro': 'localitate B', 'name_en': 'localitate B'},
        {'code_siruta': '13', 'name_ro': 'localitate C', 'name_en': 'localitate C'},
        {'code_siruta': '14', 'name_ro': 'localitate D', 'name_en': 'localitate D'},
        {'code_siruta': '15', 'name_ro': 'localitate E', 'name_en': 'localitate E'},
        {'code_siruta': '16', 'name_ro': 'localitate F', 'name_en': 'localitate F'},
        {'code_siruta': '17', 'name_ro': 'localitate G', 'name_en': 'localitate G'},
        {'code_siruta': '18', 'name_ro': 'localitate H', 'name_en': 'localitate H'},
        {'code_siruta': '19', 'name_ro': 'localitate I', 'name_en': 'localitate I'}
      ]
    },
    {
      'id': 2,
      'code_siruta': '314',
      'name_en': 'Salaj',
      'name_ro': 'Sălaj',
      'code_auto': 'SJ',
      'area_km2': 3864,
      'main_uat_siruta': '139704',
      'main_uat_name_en': 'Zalau',
      'main_uat_name_ro': 'Zalău',
      'logo': '/RO_judet_stema/RO_stema_SJ.png',
      'uat': [
        {'code_siruta': '21', 'name_ro': 'localitate J', 'name_en': 'localitate J'},
        {'code_siruta': '22', 'name_ro': 'localitate K', 'name_en': 'localitate K'},
        {'code_siruta': '23', 'name_ro': 'localitate L', 'name_en': 'localitate L'},
        {'code_siruta': '24', 'name_ro': 'localitate M', 'name_en': 'localitate M'},
        {'code_siruta': '25', 'name_ro': 'localitate N', 'name_en': 'localitate N'},
        {'code_siruta': '26', 'name_ro': 'localitate O', 'name_en': 'localitate O'},
        {'code_siruta': '27', 'name_ro': 'localitate P', 'name_en': 'localitate P'},
        {'code_siruta': '28', 'name_ro': 'localitate Q', 'name_en': 'localitate Q'},
        {'code_siruta': '29', 'name_ro': 'localitate R', 'name_en': 'localitate R'}
      ]
    },
    {
      'id': 3,
      'code_siruta': '369',
      'name_en': 'Tulcea',
      'name_ro': 'Tulcea',
      'code_auto': 'TL',
      'area_km2': 8499,
      'main_uat_siruta': '159614',
      'main_uat_name_en': 'Tulcea',
      'main_uat_name_ro': 'Tulcea',
      'logo': '/RO_judet_stema/RO_stema_TL.png',
      'uat': [
        {'code_siruta': '31', 'name_ro': 'localitate S', 'name_en': 'localitate S'},
        {'code_siruta': '32', 'name_ro': 'localitate T', 'name_en': 'localitate T'},
        {'code_siruta': '33', 'name_ro': 'localitate U', 'name_en': 'localitate U'},
        {'code_siruta': '35', 'name_ro': 'localitate X', 'name_en': 'localitate X'},
        {'code_siruta': '34', 'name_ro': 'localitate V', 'name_en': 'localitate V'},
        {'code_siruta': '36', 'name_ro': 'localitate Y', 'name_en': 'localitate Y'},
        {'code_siruta': '37', 'name_ro': 'localitate Z', 'name_en': 'localitate Z'},
        {'code_siruta': '38', 'name_ro': 'localitate W', 'name_en': 'localitate W'}
      ]
    }
  ]

}
