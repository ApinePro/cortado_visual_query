export const startActivities = new Set(["A_SUBMITTED"]);

export const endActivities = new Set([
  "W_Valideren aanvraag",
        "W_Wijzigen contractgegevens",
        "A_DECLINED",
        "W_Completeren aanvraag",
        "A_CANCELLED",
        "W_Nabellen incomplete dossiers",
        "W_Afhandelen leads",
        "W_Nabellen offertes",
        "W_Beoordelen fraude",
        "O_CANCELLED",
        "A_REGISTERED"
]);

export const activitiesInLog = {
  "A_SUBMITTED": 13087,
  "A_PARTLYSUBMITTED": 13087,
  "A_PREACCEPTED": 7367,
  "W_Completeren aanvraag": 54850,
  "A_ACCEPTED": 5113,
  "O_SELECTED": 7030,
  "A_FINALIZED": 5015,
  "O_CREATED": 7030,
  "O_SENT": 7030,
  "W_Nabellen offertes": 52016,
  "O_SENT_BACK": 3454,
  "W_Valideren aanvraag": 20809,
  "A_REGISTERED": 2246,
  "A_APPROVED": 2246,
  "O_ACCEPTED": 2243,
  "A_ACTIVATED": 2246,
  "O_CANCELLED": 3655,
  "W_Wijzigen contractgegevens": 12,
  "A_DECLINED": 7635,
  "A_CANCELLED": 2807,
  "W_Afhandelen leads": 16566,
  "O_DECLINED": 802,
  "W_Nabellen incomplete dossiers": 25190,
  "W_Beoordelen fraude": 664
};


export const variant = [
  {
      "count": 3429,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_DECLINED"
                  ]
              }
          ]
      },
      "percentage": 26.2,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ]
              ],
              "count": 3429,
              "percentage": 100
          }
      ]
  },
  {
      "count": 1872,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 14.3,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ]
              ],
              "count": 1872,
              "percentage": 100
          }
      ]
  },
  {
      "count": 271,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Afhandelen leads"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 2.07,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ]
              ],
              "count": 271,
              "percentage": 100
          }
      ]
  },
  {
      "count": 209,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 1.6,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 209,
              "percentage": 100
          }
      ]
  },
  {
      "count": 160,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 1.22,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 160,
              "percentage": 100
          }
      ]
  },
  {
      "count": 134,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 1.02,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 134,
              "percentage": 100
          }
      ]
  },
  {
      "count": 126,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.96,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 126,
              "percentage": 100
          }
      ]
  },
  {
      "count": 93,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.71,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 93,
              "percentage": 100
          }
      ]
  },
  {
      "count": 89,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.68,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 87,
              "percentage": 97.75
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 2.25
          }
      ]
  },
  {
      "count": 74,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.57,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 74,
              "percentage": 100
          }
      ]
  },
  {
      "count": 63,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.48,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 63,
              "percentage": 100
          }
      ]
  },
  {
      "count": 58,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Afhandelen leads"
                  ]
              },
              {
                  "leaf": [
                      "W_Afhandelen leads"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.44,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ]
              ],
              "count": 58,
              "percentage": 100
          }
      ]
  },
  {
      "count": 55,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.42,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 55,
              "percentage": 100
          }
      ]
  },
  {
      "count": 54,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.41,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 54,
              "percentage": 100
          }
      ]
  },
  {
      "count": 44,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.34,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 44,
              "percentage": 100
          }
      ]
  },
  {
      "count": 42,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.32,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 12,
              "percentage": 28.57
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 11,
              "percentage": 26.19
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 10,
              "percentage": 23.81
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 9,
              "percentage": 21.43
          }
      ]
  },
  {
      "count": 41,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.31,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 12,
              "percentage": 29.27
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 12,
              "percentage": 29.27
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 9,
              "percentage": 21.95
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 7,
              "percentage": 17.07
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "W_Nabellen offertes",
                          "start"
                      ],
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 2.44
          }
      ]
  },
  {
      "count": 40,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      },
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.31,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 13,
              "percentage": 32.5
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 10,
              "percentage": 25
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 10,
              "percentage": 25
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 15
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ],
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 2.5
          }
      ]
  },
  {
      "count": 39,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.3,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 39,
              "percentage": 100
          }
      ]
  },
  {
      "count": 33,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.25,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 33,
              "percentage": 100
          }
      ]
  },
  {
      "count": 32,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Beoordelen fraude"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Beoordelen fraude"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.24,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Beoordelen fraude",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Beoordelen fraude",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Beoordelen fraude",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Beoordelen fraude",
                          "complete"
                      ]
                  ]
              ],
              "count": 32,
              "percentage": 100
          }
      ]
  },
  {
      "count": 31,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Afhandelen leads"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.24,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 31,
              "percentage": 100
          }
      ]
  },
  {
      "count": 30,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.23,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 30,
              "percentage": 100
          }
      ]
  },
  {
      "count": 30,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.23,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 30,
              "percentage": 100
          }
      ]
  },
  {
      "count": 29,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.22,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 11,
              "percentage": 37.93
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 9,
              "percentage": 31.03
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 7,
              "percentage": 24.14
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 6.9
          }
      ]
  },
  {
      "count": 29,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      },
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.22,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 10,
              "percentage": 34.48
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 9,
              "percentage": 31.03
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 20.69
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 10.34
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ],
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 3.45
          }
      ]
  },
  {
      "count": 28,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.21,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 28,
              "percentage": 100
          }
      ]
  },
  {
      "count": 27,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.21,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 27,
              "percentage": 100
          }
      ]
  },
  {
      "count": 27,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.21,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 27,
              "percentage": 100
          }
      ]
  },
  {
      "count": 26,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.2,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 25,
              "percentage": 96.15
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 3.85
          }
      ]
  },
  {
      "count": 24,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.18,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 24,
              "percentage": 100
          }
      ]
  },
  {
      "count": 24,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "O_SENT_BACK"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Valideren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.18,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ],
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 10,
              "percentage": 41.67
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ],
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 7,
              "percentage": 29.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ],
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 16.67
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ],
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 12.5
          }
      ]
  },
  {
      "count": 24,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "O_SENT_BACK"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Valideren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_REGISTERED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_ACTIVATED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_APPROVED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_ACCEPTED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.18,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 16.67
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 12.5
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 12.5
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 8.33
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 8.33
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.17
          }
      ]
  },
  {
      "count": 23,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.18,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 9,
              "percentage": 39.13
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 5,
              "percentage": 21.74
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 5,
              "percentage": 21.74
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 17.39
          }
      ]
  },
  {
      "count": 21,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.16,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 21,
              "percentage": 100
          }
      ]
  },
  {
      "count": 21,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      },
                      {
                          "leaf": [
                              "O_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.16,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 28.57
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 28.57
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 5,
              "percentage": 23.81
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ],
                      [
                          "O_CANCELLED",
                          "start"
                      ],
                      [
                          "O_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 19.05
          }
      ]
  },
  {
      "count": 21,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      },
                      {
                          "leaf": [
                              "O_SENT_BACK"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Valideren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_REGISTERED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_ACTIVATED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_APPROVED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_ACCEPTED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.16,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 9.52
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 9.52
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 9.52
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 9.52
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 4.76
          }
      ]
  },
  {
      "count": 19,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Afhandelen leads"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.15,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 19,
              "percentage": 100
          }
      ]
  },
  {
      "count": 18,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.14,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 18,
              "percentage": 100
          }
      ]
  },
  {
      "count": 17,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "leaf": [
                      "W_Nabellen offertes"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "O_SENT_BACK"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Valideren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_REGISTERED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_ACTIVATED"
                          ]
                      },
                      {
                          "leaf": [
                              "A_APPROVED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_ACCEPTED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 3,
              "percentage": 17.65
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 11.76
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ],
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACTIVATED",
                          "start"
                      ],
                      [
                          "A_ACTIVATED",
                          "complete"
                      ],
                      [
                          "A_APPROVED",
                          "start"
                      ],
                      [
                          "A_APPROVED",
                          "complete"
                      ],
                      [
                          "A_REGISTERED",
                          "start"
                      ],
                      [
                          "A_REGISTERED",
                          "complete"
                      ],
                      [
                          "O_ACCEPTED",
                          "start"
                      ],
                      [
                          "O_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          }
      ]
  },
  {
      "count": 17,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 16,
              "percentage": 94.12
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 1,
              "percentage": 5.88
          }
      ]
  },
  {
      "count": 17,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 17,
              "percentage": 100
          }
      ]
  },
  {
      "count": 17,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 17,
              "percentage": 100
          }
      ]
  },
  {
      "count": 17,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_CANCELLED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.13,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 15,
              "percentage": 88.24
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ],
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 11.76
          }
      ]
  },
  {
      "count": 16,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "parallel": [
                                      {
                                          "leaf": [
                                              "O_SELECTED"
                                          ]
                                      },
                                      {
                                          "leaf": [
                                              "A_FINALIZED"
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_CREATED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "O_SENT"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Nabellen offertes"
                          ]
                      },
                      {
                          "leaf": [
                              "O_SENT_BACK"
                          ]
                      }
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Valideren aanvraag"
                          ]
                      },
                      {
                          "leaf": [
                              "A_DECLINED"
                          ]
                      },
                      {
                          "leaf": [
                              "O_DECLINED"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.12,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ],
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 6,
              "percentage": 37.5
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ],
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ],
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 25
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ],
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 4,
              "percentage": 25
          },
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SELECTED",
                          "start"
                      ],
                      [
                          "O_SELECTED",
                          "complete"
                      ],
                      [
                          "A_FINALIZED",
                          "start"
                      ],
                      [
                          "A_FINALIZED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_CREATED",
                          "start"
                      ],
                      [
                          "O_CREATED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "O_SENT",
                          "start"
                      ],
                      [
                          "O_SENT",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_SENT_BACK",
                          "start"
                      ],
                      [
                          "O_SENT_BACK",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Nabellen offertes",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "O_DECLINED",
                          "start"
                      ],
                      [
                          "O_DECLINED",
                          "complete"
                      ],
                      [
                          "A_DECLINED",
                          "start"
                      ],
                      [
                          "A_DECLINED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Valideren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 2,
              "percentage": 12.5
          }
      ]
  },
  {
      "count": 16,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.12,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 16,
              "percentage": 100
          }
      ]
  },
  {
      "count": 16,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.12,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 16,
              "percentage": 100
          }
      ]
  },
  {
      "count": 15,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.11,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 15,
              "percentage": 100
          }
      ]
  },
  {
      "count": 15,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PREACCEPTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "follows": [
                              {
                                  "leaf": [
                                      "A_ACCEPTED"
                                  ]
                              },
                              {
                                  "leaf": [
                                      "A_CANCELLED"
                                  ]
                              }
                          ]
                      },
                      {
                          "leaf": [
                              "W_Completeren aanvraag"
                          ]
                      }
                  ]
              }
          ]
      },
      "percentage": 0.11,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_ACCEPTED",
                          "start"
                      ],
                      [
                          "A_ACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ]
              ],
              "count": 15,
              "percentage": 100
          }
      ]
  },
  {
      "count": 15,
      "variant": {
          "follows": [
              {
                  "leaf": [
                      "A_SUBMITTED"
                  ]
              },
              {
                  "leaf": [
                      "A_PARTLYSUBMITTED"
                  ]
              },
              {
                  "parallel": [
                      {
                          "leaf": [
                              "W_Afhandelen leads"
                          ]
                      },
                      {
                          "leaf": [
                              "A_PREACCEPTED"
                          ]
                      }
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "W_Completeren aanvraag"
                  ]
              },
              {
                  "leaf": [
                      "A_CANCELLED"
                  ]
              }
          ]
      },
      "percentage": 0.11,
      "sub_variants": [
          {
              "variant": [
                  [
                      [
                          "A_SUBMITTED",
                          "start"
                      ],
                      [
                          "A_SUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_PARTLYSUBMITTED",
                          "start"
                      ],
                      [
                          "A_PARTLYSUBMITTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "start"
                      ]
                  ],
                  [
                      [
                          "A_PREACCEPTED",
                          "start"
                      ],
                      [
                          "A_PREACCEPTED",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Afhandelen leads",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "W_Completeren aanvraag",
                          "start"
                      ],
                      [
                          "W_Completeren aanvraag",
                          "complete"
                      ]
                  ],
                  [
                      [
                          "A_CANCELLED",
                          "start"
                      ],
                      [
                          "A_CANCELLED",
                          "complete"
                      ]
                  ]
              ],
              "count": 15,
              "percentage": 100
          }
      ]
  }
]
