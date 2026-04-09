#!/usr/bin/env python3
"""Normalize and deduplicate legal_topics and tags across all articles.

One-time script. Reads all articles, applies canonical merge maps,
deduplicates, caps at 6 topics / 8 tags, writes back.
"""

import os
import re
import yaml
from collections import Counter

ARTICLES_DIR = 'src/content/articles'
MAX_TOPICS = 6
MAX_TAGS = 8

# ============================================================
# TOPIC MERGE MAP: non-canonical topic → canonical topic
# Anything not listed passes through unchanged.
# ============================================================
TOPIC_MERGE = {
    # second-amendment
    'second-amendment-adjacent-issues': 'second-amendment',
    'second-amendment-advocacy': 'second-amendment',
    'second-amendment-carry-rights': 'second-amendment',
    'second-amendment-enforcement': 'second-amendment',
    'second-amendment-legislation': 'second-amendment',
    'second-amendment-litigation-strategy': 'second-amendment',
    'second-amendment-policy': 'second-amendment',
    'second-amendment-public-policy': 'second-amendment',
    'second-amendment-right-to-self-defense': 'second-amendment',
    'second-amendment-text-and-history': 'second-amendment',
    'second-amendment-text-history-tradition': 'second-amendment',

    # bruen-methodology
    'bruen-framework': 'bruen-methodology',
    'bruen-standard': 'bruen-methodology',
    'bruen-test': 'bruen-methodology',
    'bruen-analysis': 'bruen-methodology',
    'bruen-reaction-laws': 'bruen-methodology',
    'bevis-standard': 'bruen-methodology',
    'rahimi-methodology': 'bruen-methodology',

    # historical-tradition-test
    'historical-tradition': 'historical-tradition-test',
    'historical-tradition-firearms-regulation': 'historical-tradition-test',
    'historical-tradition-of-firearms-regulation': 'historical-tradition-test',
    'historical-analysis': 'historical-tradition-test',
    'text-history-tradition': 'historical-tradition-test',

    # assault-weapons-ban
    'assault-weapons': 'assault-weapons-ban',
    'assault-weapons-bans': 'assault-weapons-ban',
    'ar-15-second-amendment': 'assault-weapons-ban',
    'ar15-ban': 'assault-weapons-ban',
    'semi-automatic-rifles': 'assault-weapons-ban',
    'semi-automatic-rifle-ban': 'assault-weapons-ban',
    'arms-ban': 'assault-weapons-ban',
    'categorical-ban': 'assault-weapons-ban',
    'categorical-prohibition': 'assault-weapons-ban',
    'protect-illinois-communities-act': 'assault-weapons-ban',

    # magazine-bans
    'magazine-ban': 'magazine-bans',
    'magazine-capacity-ban': 'magazine-bans',
    'magazine-capacity-restrictions': 'magazine-bans',
    'magazine-restrictions': 'magazine-bans',
    'large-capacity-magazine-ban': 'magazine-bans',
    'large-capacity-magazines': 'magazine-bans',

    # nfa
    'nfa-registration': 'nfa',
    'nfa-reform': 'nfa',
    'hughes-amendment': 'nfa',
    'machine-guns': 'nfa',
    'machine-gun-ban': 'nfa',
    'machine-gun-regulation': 'nfa',
    'suppressors': 'nfa',
    'suppressor-ban': 'nfa',
    'suppressor-regulation': 'nfa',
    'short-barrel-rifle': 'nfa',
    'short-barrel-rifles': 'nfa',
    'short-barreled-rifles': 'nfa',
    'national-firearms-act': 'nfa',
    'federal-switchblade-act': 'nfa',

    # common-use-doctrine
    'common-use': 'common-use-doctrine',
    'common-use-test': 'common-use-doctrine',
    'in-common-use': 'common-use-doctrine',
    'in-common-use-test': 'common-use-doctrine',

    # dangerous-and-unusual
    'dangerous-and-unusual-test': 'dangerous-and-unusual',
    'dangerous-and-unusual-weapons': 'dangerous-and-unusual',

    # concealed-carry
    'carry-rights': 'concealed-carry',
    'carry-permits': 'concealed-carry',
    'carry-restrictions': 'concealed-carry',
    'ccw-licensing': 'concealed-carry',
    'shall-issue': 'concealed-carry',
    'may-issue': 'concealed-carry',
    'concealed-carry-permitting': 'concealed-carry',
    'shall-issue-licensing': 'concealed-carry',
    'shall-issue-permitting': 'concealed-carry',
    'shall-issue-versus-may-issue': 'concealed-carry',
    'handgun-carry': 'concealed-carry',
    'public-carry': 'concealed-carry',
    'nationwide-carry': 'concealed-carry',
    'nationwide-reciprocity': 'concealed-carry',
    'licensing-regimes': 'concealed-carry',
    'licensing-delays': 'concealed-carry',
    'permit-denial': 'concealed-carry',
    'constitutional-carry': 'concealed-carry',

    # sensitive-places
    'gun-free-zones': 'sensitive-places',
    'comprehensive-security': 'sensitive-places',
    'government-property': 'sensitive-places',
    'private-property-open-to-public': 'sensitive-places',
    'post-office-carry-ban': 'sensitive-places',
    'post-office-gun-ban': 'sensitive-places',
    'postal-handgun-ban': 'sensitive-places',
    'usps-gun-prohibition': 'sensitive-places',

    # standing
    'standing-doctrine': 'standing',
    'associational-standing': 'standing',
    'article-iii-standing': 'standing',
    'article-iii': 'standing',
    'class-certification': 'standing',
    'mootness': 'standing',

    # facial-challenge
    'facial-challenges': 'facial-challenge',
    'as-applied-challenge': 'facial-challenge',
    'as-applied-challenges': 'facial-challenge',

    # executive-power
    'article-ii': 'executive-power',
    'article-ii-vesting-clause': 'executive-power',
    'article-ii-executive-power': 'executive-power',
    'presidential-removal-power': 'executive-power',
    'removal-power': 'executive-power',
    'executive-authority': 'executive-power',
    'executive-order': 'executive-power',
    'executive-policy': 'executive-power',
    'executive-enforcement': 'executive-power',
    'federal-executive-power': 'executive-power',
    'executive-branch-management': 'executive-power',
    'presidential-authority': 'executive-power',
    'presidential-executive-power': 'executive-power',
    'presidential-commission': 'executive-power',
    'unitary-executive': 'executive-power',
    'commander-in-chief': 'executive-power',
    'for-cause-removal': 'executive-power',
    'principal-officer-removal': 'executive-power',
    'presidential-war-powers': 'executive-power',
    'presidential-pardon-power': 'executive-power',
    'presidential-pardons': 'executive-power',
    'clemency': 'executive-power',
    'autopen': 'executive-power',
    'humphreys-executor': 'executive-power',
    'doge': 'executive-power',
    'doge-data-access': 'executive-power',

    # administrative-law
    'administrative-agencies': 'administrative-law',
    'administrative-procedure-act': 'administrative-law',
    'chevron-deference': 'administrative-law',
    'deregulation': 'administrative-law',
    'major-questions-doctrine': 'administrative-law',
    'administrative-function': 'administrative-law',
    'administrative-nullification': 'administrative-law',
    'notice-and-comment-rulemaking': 'administrative-law',
    'independent-agencies': 'administrative-law',
    'independent-agency-constitutionality': 'administrative-law',
    'independent-agency-doctrine': 'administrative-law',
    'ultra-vires-regulations': 'administrative-law',
    'code-of-federal-regulations': 'administrative-law',
    'cfpb': 'administrative-law',
    'consumer-product-safety-commission': 'administrative-law',
    'federal-trade-commission': 'administrative-law',
    'epa-grant-administration': 'administrative-law',

    # atf-enforcement
    'atf': 'atf-enforcement',
    'atf-misconduct': 'atf-enforcement',
    'atf-regulations': 'atf-enforcement',
    'pistol-braces': 'atf-enforcement',

    # doj-enforcement
    'department-of-justice': 'doj-enforcement',
    'doj-policy': 'doj-enforcement',
    'doj-brief': 'doj-enforcement',
    'doj-amicus-brief': 'doj-enforcement',
    'doj-amicus-participation': 'doj-enforcement',
    'doj-civil-rights-division': 'doj-enforcement',
    'doj-second-amendment-task-force': 'doj-enforcement',
    'doj-second-amendment-unit': 'doj-enforcement',
    'doj-enforcement': 'doj-enforcement',
    'doj-positions': 'doj-enforcement',
    'solicitor-general': 'doj-enforcement',
    'solicitor-general-brief': 'doj-enforcement',
    'attorney-general': 'doj-enforcement',
    'attorney-general-overreach': 'doj-enforcement',
    'office-of-legal-counsel': 'doj-enforcement',
    'olc-memo': 'doj-enforcement',
    'olc-opinions': 'doj-enforcement',

    # fourteenth-amendment
    'equal-protection': 'fourteenth-amendment',
    'due-process': 'fourteenth-amendment',
    'birthright-citizenship': 'fourteenth-amendment',
    'black-codes': 'fourteenth-amendment',

    # first-amendment
    'free-speech': 'first-amendment',
    'freedom-of-speech': 'first-amendment',
    'religious-liberty': 'first-amendment',
    'free-exercise-clause': 'first-amendment',
    'anonymous-speech': 'first-amendment',
    'compelled-speech': 'first-amendment',
    'viewpoint-discrimination': 'first-amendment',
    'academic-freedom': 'first-amendment',
    'freedom-of-association': 'first-amendment',
    'expressive-conduct': 'first-amendment',
    'commercial-speech': 'first-amendment',

    # immigration
    'immigration-law': 'immigration',
    'immigration-enforcement': 'immigration',
    'immigration-parole': 'immigration',
    'illegal-immigration': 'immigration',
    'immigration-nationality-act': 'immigration',
    'illegal-alien-gun-rights': 'immigration',
    'categorical-parole': 'immigration',
    'temporary-protected-status': 'immigration',
    'sanctuary-cities': 'immigration',
    'state-sanctuary-laws': 'immigration',

    # redistricting
    'gerrymandering': 'redistricting',
    'racial-gerrymandering': 'redistricting',
    'partisan-gerrymandering': 'redistricting',
    'mid-decade-gerrymandering': 'redistricting',
    'congressional-redistricting': 'redistricting',
    'voting-rights-act': 'redistricting',
    'section-2-voting-rights-act': 'redistricting',
    'voter-registration': 'redistricting',
    'election-law': 'redistricting',

    # felon-in-possession
    'felon-in-possession-statute': 'felon-in-possession',
    '18-usc-922g': 'felon-in-possession',
    '18-usc-922g1': 'felon-in-possession',
    'prohibited-persons': 'felon-in-possession',
    'nonviolent-felon-disarmament': 'felon-in-possession',
    'categorical-disarmament': 'felon-in-possession',

    # young-adults
    'age-restrictions': 'young-adults',
    'age-based-restrictions': 'young-adults',
    'age-based-firearms-restrictions': 'young-adults',
    'eighteen-to-twenty-year-olds': 'young-adults',
    'under-21-handgun-purchase': 'young-adults',
    'young-adults-second-amendment': 'young-adults',
    'young-adults-second-amendment-rights': 'young-adults',
    'non-resident-handgun-purchase-ban': 'young-adults',
    'ffl-handgun-purchase': 'young-adults',

    # drug-user-gun-ban
    '18-usc-922g3': 'drug-user-gun-ban',
    'drug-users': 'drug-user-gun-ban',

    # mental-health
    'civil-commitment': 'mental-health',
    '18-usc-922g4': 'mental-health',
    'deinstitutionalization': 'mental-health',
    'mental-health-firearms': 'mental-health',
    'mental-health-policy': 'mental-health',
    'mental-health-prohibitions': 'mental-health',
    'section-922g4': 'mental-health',

    # certiorari
    'certiorari-petition': 'certiorari',
    'certiorari-strategy': 'certiorari',
    'case-vehicle-selection': 'certiorari',
    'shadow-docket': 'certiorari',

    # en-banc-review
    'en-banc': 'en-banc-review',
    'en-banc-argument': 'en-banc-review',

    # split-of-authority
    'circuit-split': 'split-of-authority',

    # injunctive-relief
    'preliminary-injunction': 'injunctive-relief',
    'permanent-injunction': 'injunctive-relief',
    'nationwide-injunction': 'injunctive-relief',
    'preliminary-injunction-standard': 'injunctive-relief',
    'universal-injunction': 'injunctive-relief',
    'stay-of-injunction': 'injunctive-relief',
    'injunction-scope': 'injunctive-relief',
    'emergency-stay': 'injunctive-relief',
    'emergency-motions': 'injunctive-relief',
    'emergency-applications': 'injunctive-relief',

    # firearms-regulation
    'firearms-regulations': 'firearms-regulation',
    'gun-control': 'firearms-regulation',
    'gun-control-policy': 'firearms-regulation',
    'gun-control-act-of-1968': 'firearms-regulation',
    'gun-control-act-statutory-interpretation': 'firearms-regulation',
    'state-firearms-law': 'firearms-regulation',
    'state-gun-laws': 'firearms-regulation',
    'state-legislation': 'firearms-regulation',
    'federal-firearms-law': 'firearms-regulation',
    'firearms-enforcement': 'firearms-regulation',
    'state-gun-legislation': 'firearms-regulation',
    'firearms-registration': 'firearms-regulation',
    'gun-registry': 'firearms-regulation',
    'storage-requirements': 'firearms-regulation',
    'handgun-roster': 'firearms-regulation',
    'gun-violence-prevention': 'firearms-regulation',
    'gun-rights-advocacy': 'firearms-regulation',

    # right-to-bear-arms
    'individual-right-to-bear-arms': 'right-to-bear-arms',
    'arms-definition': 'right-to-bear-arms',
    'arms-protected-by-the-second-amendment': 'right-to-bear-arms',
    'collective-arms-bearing': 'right-to-bear-arms',
    'collectivism': 'right-to-bear-arms',
    'non-lethal-arms': 'right-to-bear-arms',
    'stun-guns': 'right-to-bear-arms',
    'knife-rights': 'right-to-bear-arms',
    'infringement-defined': 'right-to-bear-arms',
    'infringement-definition': 'right-to-bear-arms',

    # right-to-acquire
    'acquisition-rights': 'right-to-acquire',
    'ancillary-rights': 'right-to-acquire',
    'ammunition-regulation': 'right-to-acquire',
    'ammunition-regulations': 'right-to-acquire',
    'ammunition-background-checks': 'right-to-acquire',
    'background-checks': 'right-to-acquire',
    'right-to-acquire-arms': 'right-to-acquire',
    'handgun-mail-ban': 'right-to-acquire',
    '18-usc-1715': 'right-to-acquire',
    'handgun-purchase': 'right-to-acquire',

    # self-defense
    'armed-teacher-programs': 'self-defense',

    # product-liability
    'plcaa': 'product-liability',
    'contributory-infringement': 'product-liability',
    'copyright-law': 'product-liability',
    'antitrust-law': 'product-liability',
    'gun-industry-liability': 'product-liability',
    'protection-of-lawful-commerce-in-arms-act': 'product-liability',

    # federal-reserve
    'federal-reserve-independence': 'federal-reserve',
    'banking-regulation': 'federal-reserve',
    'debanking': 'federal-reserve',
    'operation-chokepoint': 'federal-reserve',
    'firearms-industry-access-to-financial-services': 'federal-reserve',
    'firearms-industry-financial-access': 'federal-reserve',

    # separation-of-powers
    'appropriations-clause': 'separation-of-powers',
    'article-i': 'separation-of-powers',
    'article-i-powers': 'separation-of-powers',
    'article-i-taxing-power': 'separation-of-powers',
    'commerce-clause': 'separation-of-powers',
    'enumerated-powers': 'separation-of-powers',
    'nondelegation-doctrine': 'separation-of-powers',
    'article-one-enumerated-powers': 'separation-of-powers',
    'federal-spending-power': 'separation-of-powers',
    'taxing-power': 'separation-of-powers',
    'anti-commandeering': 'separation-of-powers',
    'constitutional-structure': 'separation-of-powers',
    'structural-constitution': 'separation-of-powers',
    'supremacy-clause': 'separation-of-powers',

    # parental-rights
    'education-law': 'parental-rights',
    'public-education': 'parental-rights',

    # ghost-guns
    '3d-printing': 'ghost-guns',
    'privately-made-firearms': 'ghost-guns',
    'personal-manufacture': 'ghost-guns',
    'serial-number-requirements': 'ghost-guns',

    # originalism
    'constitutional-interpretation': 'originalism',
    'constitutional-theory': 'originalism',
    'plain-text-analysis': 'originalism',
    'doctrine-of-liquidation': 'originalism',
    'ordered-liberty': 'originalism',
    'heller-doctrine': 'originalism',
    'heller-standard': 'originalism',

    # federalism
    'federal-preemption': 'federalism',
    'state-preemption': 'federalism',
    'state-constitutional-law': 'federalism',
    'state-constitutional-right-to-bear-arms': 'federalism',
    'state-constitutional-amendments': 'federalism',
    'state-action': 'federalism',
    'intergovernmental-immunity': 'federalism',

    # dei → executive-power
    'dei-corporate-policy': 'executive-power',
    'dei-funding': 'executive-power',
    'dei-policy': 'executive-power',
    'dei-programs': 'executive-power',

    # litigation-strategy (keep as canonical)
    'civil-rights-litigation': 'litigation-strategy',
    'lawfare': 'litigation-strategy',

    # judicial-appointments (new canonical for court/judge topics)
    'blue-slip-process': 'judicial-appointments',
    'judicial-accountability': 'judicial-appointments',
    'judicial-activism': 'judicial-appointments',
    'judicial-confirmations': 'judicial-appointments',
    'judicial-conduct': 'judicial-appointments',
    'judicial-overreach': 'judicial-appointments',
    'judicial-philosophy': 'judicial-appointments',
    'supreme-court-nominations': 'judicial-appointments',
    'federal-judiciary': 'judicial-appointments',
    'court-packing': 'judicial-appointments',
    'senate-confirmation': 'judicial-appointments',

    # criminal-law (new canonical)
    'aiding-and-abetting': 'criminal-law',
    'drug-conspiracy': 'criminal-law',
    'drug-offenses': 'criminal-law',
    'federal-criminal-law': 'criminal-law',
    'grand-jury-proceedings': 'criminal-law',
    'obstruction-of-justice': 'criminal-law',
    'overcriminalization': 'criminal-law',
    'rico': 'criminal-law',
    'violent-crime': 'criminal-law',
    'political-violence': 'criminal-law',

    # More separation-of-powers merges
    'constitutional-law': 'separation-of-powers',
    'constitutional-powers': 'separation-of-powers',
    'constitutional-amendment-procedure': 'separation-of-powers',
    'congressional-authority': 'separation-of-powers',
    'congressional-oversight': 'separation-of-powers',
    'house-of-representatives': 'separation-of-powers',
    'senate-procedure': 'separation-of-powers',
    'tenth-amendment': 'separation-of-powers',
    'full-faith-and-credit': 'separation-of-powers',
    'electoral-count-act': 'separation-of-powers',
    'one-big-beautiful-bill': 'separation-of-powers',

    # More fourteenth-amendment merges
    'civil-rights': 'fourteenth-amendment',
    'civil-rights-enforcement': 'fourteenth-amendment',
    'civic-rights': 'fourteenth-amendment',
    'section-1983': 'fourteenth-amendment',
    'disparate-impact': 'fourteenth-amendment',
    'equal-application-of-law': 'fourteenth-amendment',
    'race-based-admissions': 'fourteenth-amendment',
    'racial-classification': 'fourteenth-amendment',
    'public-accommodations': 'fourteenth-amendment',
    'gender-dysphoria': 'fourteenth-amendment',
    'gender-identity': 'fourteenth-amendment',
    'anti-discrimination-law': 'fourteenth-amendment',

    # More first-amendment merges
    'membership-list-disclosure': 'first-amendment',
    'press-access': 'first-amendment',
    'social-media-regulation': 'first-amendment',
    'protests-demonstrations': 'first-amendment',
    'digital-rights': 'first-amendment',
    'white-house-press-pool': 'first-amendment',

    # More felon-in-possession merges
    'dangerous-persons': 'felon-in-possession',
    'restoration-of-rights': 'felon-in-possession',

    # More concealed-carry merges
    'military-carry': 'concealed-carry',
    'rifle-carry': 'concealed-carry',

    # More second-amendment merges
    'militia-clause': 'second-amendment',
    'militia-training': 'second-amendment',
    'the-people': 'second-amendment',
    'private-militia': 'second-amendment',
    'conservative-movement': 'second-amendment',
    'gun-culture': 'second-amendment',
    'media-analysis': 'second-amendment',
    'media-bias': 'second-amendment',

    # More firearms-regulation merges
    'arms-export-control': 'firearms-regulation',
    'california-gun-law': 'firearms-regulation',
    'dc-gun-laws': 'firearms-regulation',
    'dc-crime': 'firearms-regulation',
    'new-jersey-gun-laws': 'firearms-regulation',
    'federal-firearms-licensee': 'firearms-regulation',
    'firearm-export-regulations': 'firearms-regulation',
    'proposition-63': 'firearms-regulation',
    'hunting-regulations': 'firearms-regulation',
    'mass-shootings': 'firearms-regulation',
    'overton-window': 'firearms-regulation',

    # More doj-enforcement merges
    'federal-enforcement': 'doj-enforcement',
    'federal-law-enforcement': 'doj-enforcement',
    'pattern-or-practice': 'doj-enforcement',
    'prosecutorial-discretion': 'doj-enforcement',
    'prosecutorial-disqualification': 'doj-enforcement',
    'prosecutorial-priorities': 'doj-enforcement',
    'law-enforcement': 'doj-enforcement',

    # More executive-power merges
    'executive-branch-spending-authority': 'executive-power',
    'federal-benefits': 'executive-power',
    'federal-contracting': 'executive-power',
    'federal-policy': 'executive-power',
    'grant-termination': 'executive-power',
    'inflation-reduction-act': 'executive-power',
    'investigative-subpoenas': 'executive-power',
    'national-guard-deployment': 'executive-power',
    'national-guard-federalization': 'executive-power',

    # More immigration merges
    'detention': 'immigration',
    'narco-terrorism': 'immigration',
    'private-immigration-detention': 'immigration',

    # More self-defense merges
    'school-safety-policy': 'self-defense',
    'school-security-hardening': 'self-defense',
    'police-duty-to-protect': 'self-defense',

    # More right-to-bear-arms merges
    'individual-rights': 'right-to-bear-arms',
    'letters-of-marque': 'right-to-bear-arms',
    'group-firearms-training': 'right-to-bear-arms',
    'civil-liberties': 'right-to-bear-arms',
    'constitutional-rights': 'right-to-bear-arms',
    'fundamental-rights': 'right-to-bear-arms',

    # More originalism merges
    'natural-rights': 'originalism',
    'comparative-constitutional-law': 'originalism',
    'judicial-security': 'originalism',

    # More bruen-methodology merges
    'intermediate-scrutiny': 'bruen-methodology',
    'strict-scrutiny': 'bruen-methodology',

    # More federalism merges
    'state-authority': 'federalism',
    'district-of-columbia': 'federalism',
    'washington-dc': 'federalism',

    # More injunctive-relief merges
    'interlocutory-appeal': 'injunctive-relief',
    'remedy': 'injunctive-relief',

    # More redistricting merges
    'midterm-elections': 'redistricting',
    'electoral-implications': 'redistricting',
    'voting-rights': 'redistricting',
    'political-science': 'redistricting',
    'political-trends': 'redistricting',

    # More federal-reserve merges
    'esg-investing': 'federal-reserve',
    'index-funds': 'federal-reserve',
    'monetary-policy-accountability': 'federal-reserve',

    # More administrative-law merges
    'individual-adjudication': 'administrative-law',
    'civil-service-rules': 'administrative-law',
    'federal-employee-privacy-rights': 'administrative-law',
    'federal-employment-law': 'administrative-law',
    'bureau-of-industry-and-security': 'administrative-law',

    # More sensitive-places merges
    'public-parks': 'sensitive-places',
    'public-transportation': 'sensitive-places',

    # Remaining singletons absorbed
    'civil-procedure': 'standing',
    'ninth-circuit': 'split-of-authority',
    'democratic-party': 'redistricting',
    'conflict-of-interest': 'doj-enforcement',
    'legal-ethics': 'doj-enforcement',
    'statutory-construction': 'originalism',
    'statutory-definitions': 'originalism',
    'statutory-interpretation': 'originalism',
    'findings-of-fact': 'standing',
    'evidence': 'standing',
    'mandamus': 'injunctive-relief',
    'motion-to-vacate': 'injunctive-relief',
    'sua-sponte': 'injunctive-relief',
    'vacatur': 'injunctive-relief',
    'forum-shopping': 'standing',
    'sovereign-immunity': 'standing',
    'judicial-immunity': 'standing',
    'extraterritorial-jurisdiction': 'standing',
    'foreign-policy': 'executive-power',
    'national-security': 'executive-power',
    'public-broadcasting': 'executive-power',
    'proxy-voting': 'separation-of-powers',
    'classified-information': 'executive-power',
    'federal-enforcement': 'doj-enforcement',
    'habeas-corpus': 'fourteenth-amendment',
    'fifth-amendment': 'fourteenth-amendment',
    'fourth-amendment': 'fourteenth-amendment',
    'legal-scholarship': 'originalism',
    'international-law': 'originalism',
    'retaliation': 'doj-enforcement',
    'reputational-risk': 'federal-reserve',
    'predicate-exception': 'felon-in-possession',
    'drone-regulations': 'firearms-regulation',
    'military-academies': 'sensitive-places',
    'mortgage-fraud-investigation': 'doj-enforcement',
    'whistleblower-protection': 'executive-power',
    'whistleblower-retaliation': 'executive-power',
    'court-of-federal-claims': 'standing',
    'tucker-act': 'standing',
    'tucker-act-jurisdiction': 'standing',

    # Round 3: final stragglers
    'constitutional-history': 'historical-tradition-test',
    'oral-argument': 'certiorari',
    'oral-argument-analysis': 'certiorari',
    'vampire-rule': 'bruen-methodology',
}


# ============================================================
# TAG MERGE MAP: raw tag → canonical tag
# ============================================================
TAG_MERGE = {
    # --- Second Amendment ---
    'Second Amendment Enforcement': 'Second Amendment',
    'Second Amendment Policy': 'Second Amendment',
    'Second Amendment Strategy': 'Second Amendment',
    'Second Amendment Task Force': 'Second Amendment',
    'Second Amendment Unit': 'Second Amendment',
    'Gun Rights': 'Second Amendment',
    'Firearms Rights': 'Second Amendment',
    'Right to Bear Arms': 'Second Amendment',
    'Right to Keep and Bear Arms': 'Second Amendment',

    # --- SCOTUS ---
    'Supreme Court': 'SCOTUS',

    # --- Bruen ---
    'Bruen Standard': 'Bruen',
    'Bruen Framework': 'Bruen',

    # --- Heller ---
    # (keep "Heller" as-is)

    # --- Assault Weapons ---
    'AR-15 Ban': 'Assault Weapons',
    'Assault Weapons Ban': 'Assault Weapons',
    'Illinois Assault Weapons Ban': 'Assault Weapons',
    'Illinois Gun Ban': 'Assault Weapons',
    'Semi-Automatic Rifles': 'Assault Weapons',
    'Gun Ban': 'Assault Weapons',
    'Firearms Prohibition': 'Assault Weapons',
    'Arms Ban': 'Assault Weapons',

    # --- Magazine Ban ---
    'Magazine Restrictions': 'Magazine Ban',
    'Magazines': 'Magazine Ban',
    'Standard Capacity Magazines': 'Magazine Ban',
    'Large Capacity Magazines': 'Magazine Ban',

    # --- Machine Guns ---
    'Machine Gun': 'Machine Guns',
    'NFA': 'Machine Guns',
    'Hughes Amendment': 'Machine Guns',
    'National Firearms Act': 'Machine Guns',
    'Fully Automatic Weapons': 'Machine Guns',

    # --- Suppressors ---
    'Suppressor': 'Suppressors',
    'Silencers': 'Suppressors',

    # --- Short-Barrel Rifles ---
    'Short Barrel Rifle': 'Short-Barrel Rifles',
    'Short Barrel Rifles': 'Short-Barrel Rifles',

    # --- ATF ---
    'Agency Misconduct': 'ATF',

    # --- DOJ ---
    'DOJ Brief': 'DOJ',
    'DOJ Lawsuit': 'DOJ',
    'DOJ Amicus': 'DOJ',
    'DOJ Argument': 'DOJ',
    'DOJ Intervention': 'DOJ',
    'DOJ Investigation': 'DOJ',
    'Trump DOJ': 'DOJ',
    'Department of Justice': 'DOJ',

    # --- People ---
    'Harmy Dhillon': 'Harmeet Dhillon',
    'Jennifer Mascot': 'Jennifer Mascott',
    'Lawrence Van Dyke': 'Lawrence VanDyke',
    'Alito': 'Justice Alito',
    'Gorsuch': 'Justice Gorsuch',
    'Thomas': 'Justice Thomas',
    'Clarence Thomas': 'Justice Thomas',
    'Scalia': 'Justice Scalia',
    'Chief Justice Roberts': 'SCOTUS',

    # --- Sensitive Places ---
    'Gun-Free Zones': 'Sensitive Places',
    'Gun Free Zones': 'Sensitive Places',
    'Government Mandated Gun Free Zones': 'Sensitive Places',

    # --- Concealed Carry ---
    'CCW Permit': 'Concealed Carry',
    'CCW Permitting': 'Concealed Carry',
    'Carry Ban': 'Concealed Carry',
    'Carry Permits': 'Concealed Carry',
    'Carry Rights': 'Concealed Carry',
    'Gun Permits': 'Concealed Carry',
    'Shall Issue': 'Concealed Carry',
    'Constitutional Carry': 'Concealed Carry',
    'Nationwide Carry': 'Concealed Carry',
    'Nationwide Reciprocity': 'Concealed Carry',
    'Licensing': 'Concealed Carry',
    'Non-Resident Carry Rights': 'Concealed Carry',

    # --- Standing ---
    'Standing Doctrine': 'Standing',

    # --- Constitutional Law ---
    'Administrative Law': 'Constitutional Law',
    'Administrative State': 'Constitutional Law',
    'Administrative Procedure Act': 'Constitutional Law',
    'Constitutional Rights': 'Constitutional Law',
    'Constitutional Powers': 'Constitutional Law',
    'Structural Constitution': 'Constitutional Law',

    # --- Executive Power ---
    'Executive Action': 'Executive Power',
    'Executive Authority': 'Executive Power',
    'Executive Branch': 'Executive Power',
    'Executive Order': 'Executive Power',
    'Presidential Authority': 'Executive Power',
    'Presidential Power': 'Executive Power',
    'Presidential Removal Power': 'Executive Power',
    'Removal Power': 'Executive Power',
    'Unitary Executive': 'Executive Power',
    'DOGE': 'Executive Power',
    'Office of Personnel Management': 'Executive Power',

    # --- Immigration ---
    'Immigration Detention': 'Immigration',
    'Immigration Enforcement': 'Immigration',
    'Immigration Nationality Act': 'Immigration',
    'Illegal Aliens': 'Immigration',
    'ICE': 'Immigration',
    'ICE Enforcement': 'Immigration',

    # --- Fourteenth Amendment ---
    'Equal Protection': 'Fourteenth Amendment',
    'Due Process': 'Fourteenth Amendment',
    'Birthright Citizenship': 'Fourteenth Amendment',
    'Black Codes': 'Fourteenth Amendment',

    # --- First Amendment ---
    'Free Speech': 'First Amendment',
    'Religious Freedom': 'First Amendment',
    'Academic Freedom': 'First Amendment',
    'Anonymous Speech': 'First Amendment',
    'Compelled Speech': 'First Amendment',
    'Freedom of Association': 'First Amendment',
    'Viewpoint Discrimination': 'First Amendment',
    'Press Freedom': 'First Amendment',
    'Free Press': 'First Amendment',

    # --- States ---
    'Virginia constitutional amendment': 'Virginia',
    'New York City': 'New York',
    'Illinois PICA': 'Illinois',
    'D.C. Gun Law': 'D.C.',
    'DC Circuit': 'D.C. Circuit',
    'DC Crime Statistics': 'D.C.',
    'Washington DC': 'D.C.',

    # --- Trump Administration ---
    'Trump': 'Trump Administration',
    'Donald Trump': 'Trump Administration',

    # --- Organizations ---
    'SAF': 'Second Amendment Foundation',

    # --- Self-Defense ---
    'Armed Teachers': 'Self-Defense',
    'Armed Citizenry': 'Self-Defense',

    # --- Ghost Guns ---
    '3D Printing': 'Ghost Guns',
    'Privately Made Firearms': 'Ghost Guns',
    'Personal Manufacture': 'Ghost Guns',

    # --- Waiting Periods ---
    'Waiting Period': 'Waiting Periods',
    'Cooling-Off Period': 'Waiting Periods',

    # --- Federal Reserve ---
    'Federal Reserve Act': 'Federal Reserve',
    'Federal Reserve Independence': 'Federal Reserve',
    'Monetary Policy': 'Federal Reserve',
    'Debanking': 'Federal Reserve',
    'Operation Chokepoint': 'Federal Reserve',

    # --- Redistricting ---
    'Gerrymandering': 'Redistricting',
    'Racial Gerrymandering': 'Redistricting',
    'Congressional Elections': 'Redistricting',

    # --- Voting Rights Act ---
    'Voting Rights': 'Voting Rights Act',

    # --- Misc normalizations ---
    'Separation of Powers': 'Constitutional Law',
    'Enumerated Powers': 'Constitutional Law',
    'Nondelegation Doctrine': 'Constitutional Law',
    'Commerce Clause': 'Constitutional Law',
    'Appropriations Clause': 'Constitutional Law',
    'Federalism': 'Constitutional Law',
    'Gun Control': 'Gun Control',
    'Gun Policy': 'Gun Control',
    'Firearms Regulations': 'Gun Control',
    'Gun Control Act': 'Gun Control',
    'Non-Violent Felons': 'Felon in Possession',
    'Nonviolent Felons': 'Felon in Possession',
    'Felons': 'Felon in Possession',
    'Prohibited Persons': 'Felon in Possession',
    'Mental Institutions': 'Mental Health',
    'Mental Health Policy': 'Mental Health',
    'Dangerous and Unusual': 'Dangerous and Unusual Weapons',
    'Dangerous And Unusual': 'Dangerous and Unusual Weapons',
    'Dangerous and Unusual Weapons': 'Dangerous and Unusual Weapons',
    'Common Use': 'Common Use Test',
    'Common Use Test': 'Common Use Test',
    'In Common Use': 'Common Use Test',
    'Historical Tradition': 'Bruen',
    'Text and History': 'Bruen',
    'Preliminary Injunction': 'Injunctive Relief',
    'Nationwide Injunction': 'Injunctive Relief',
    'Injunction': 'Injunctive Relief',
    'Injunction Vacated': 'Injunctive Relief',
    'Emergency Docket': 'SCOTUS',
    'Emergency Stay': 'Injunctive Relief',
    'Shadow Docket': 'SCOTUS',
    'Cert Denied': 'Certiorari',
    'Cert Granted': 'Certiorari',
    'Circuit Split': 'Circuit Split',
    'En Banc': 'En Banc',
    'Originalism': 'Originalism',
    'Oral Argument': 'Oral Argument',
    'Legal Analysis': 'Legal Analysis',
    'Legal Strategy': 'Legal Analysis',
    'Litigation Strategy': 'Legal Analysis',
    'Federal Courts': 'Federal Courts',
    'Federal Judiciary': 'Federal Courts',
    'Federal Judges': 'Federal Courts',
    'Lower Courts': 'Federal Courts',
    'Solicitor General': 'DOJ',
    'Attorney General': 'DOJ',
    'Civil Rights Division': 'DOJ',
    'Registration': 'Firearms Registration',
    'Firearms Registration': 'Firearms Registration',
    'School Safety': 'Self-Defense',
    'School Security': 'Self-Defense',
    'Drug User Gun Ban': 'Drug User Gun Ban',
    'Background Checks': 'Background Checks',
    'Red Flag Laws': 'Red Flag Laws',
    'Campus Carry': 'Campus Carry',
    'Parental Rights': 'Parental Rights',
    'Federal Preemption': 'Constitutional Law',
    'Public Transportation': 'Sensitive Places',
    'Public Transit': 'Sensitive Places',
    'Public Parks': 'Sensitive Places',
    'Post Office': 'Sensitive Places',
    'Firearms Policy Coalition': 'Firearms Policy Coalition',
    'Second Amendment Foundation': 'Second Amendment Foundation',
    'Federalist Society': 'Federalist Society',
    'Gun Owners of America': 'Gun Owners of America',
    'NRA': 'NRA',
    'Cooper And Kirk': 'Cooper and Kirk',
    'Biden Administration': 'Biden Administration',
    'Biden Era Regulations': 'Biden Administration',
    'DEI': 'Executive Power',
    'Deep State': 'Executive Power',

    # --- Additional merges (round 2) ---
    # Statute number variants → Felon in Possession
    '922(g)(1)': 'Felon in Possession',
    '922(g)(3)': 'Drug User Gun Ban',
    '922(g)(4)': 'Mental Health',
    '922G': 'Felon in Possession',
    '922g': 'Felon in Possession',
    '922-o': 'Machine Guns',
    '18 USC 922': 'Felon in Possession',
    '18 USC 922(g)': 'Felon in Possession',
    '18 USC 922(o)': 'Machine Guns',
    '18 USC 922g1': 'Felon in Possession',
    '18 USC 922g4': 'Mental Health',
    '18 USC 1715': 'Right to Acquire',

    # OLC → DOJ
    'OLC Memo': 'DOJ',
    'OLC Opinion': 'DOJ',
    'OLC opinion': 'DOJ',
    'Office of Legal Counsel': 'DOJ',

    # Judge duplicates
    'Judge Van Dyke': 'Judge VanDyke',
    'Judge Vandyke': 'Judge VanDyke',

    # Self Defense variant
    'Self Defense': 'Self-Defense',

    # Facial Challenge
    'Facial Challenges': 'Facial Challenge',

    # More Second Amendment
    'Second Amendment Implications': 'Second Amendment',
    'Second Amendment Working Group': 'Second Amendment',
    'Gun Rights Enforcement': 'Second Amendment',
    'Gun Rights Organizations': 'Second Amendment',

    # Public Carry → Concealed Carry
    'Public Carry': 'Concealed Carry',
    'Non-Resident Ban': 'Concealed Carry',

    # Administrative/Constitutional
    'Administrative Nullification': 'Constitutional Law',
    'Deregulation': 'Constitutional Law',
    'Regulatory Reform': 'Constitutional Law',
    'Federal Regulations': 'Constitutional Law',
    'Federal Gun Law': 'Gun Control',
    'Federal Gun Ban': 'Assault Weapons',

    # Person/Judge normalizations
    'Alvin Bragg': 'DOJ',
    'Fani Willis': 'DOJ',

    # State normalization
    'District of Columbia': 'D.C.',
    'Connecticut': 'Connecticut',

    # Case-name normalizations (keep but fix format)
    'Hammani v. United States': 'United States v. Hammani',
    'Harmani Case': 'United States v. Hammani',

    # More explicit merges for lowercase tags
    'ammunition': 'Ammunition',
    'caetano': 'Caetano',
    'california': 'California',
    'colorado': 'Colorado',
    'standing': 'Standing',
    'immigration': 'Immigration',
    'mootness': 'Standing',
    'vacatur': 'Injunctive Relief',
    'plcaa': 'PLCAA',
    'betamax': 'Product Liability',
    'sony': 'Product Liability',
    'ndaa': 'NDAA',
    'redistricting': 'Redistricting',

    # Space-separated lowercase merges
    'categorical bans': 'Assault Weapons',
    'categorical prohibition': 'Assault Weapons',
    'emergency motion': 'Injunctive Relief',
    'emergency stay': 'Injunctive Relief',
    'fully automatic': 'Machine Guns',
    'gun control backlash': 'Gun Control',
    'mid-decade gerrymandering': 'Redistricting',
    'oral arguments': 'Oral Argument',
    'pistol braces': 'ATF',
    'racial discrimination': 'Fourteenth Amendment',
    'statutory interpretation': 'Constitutional Law',
    'handgun mailing': 'Right to Acquire',
    'fundamental rights': 'Constitutional Law',
    'due process': 'Fourteenth Amendment',
    'equal protection': 'Fourteenth Amendment',
    'executive branch': 'Executive Power',
    'precedential effect': 'Federal Courts',
    'transgender rights': 'Fourteenth Amendment',
    'common use': 'Common Use Test',
    'short-barreled rifles': 'Short-Barrel Rifles',
    'administrative law': 'Constitutional Law',
    'assault weapons ban': 'Assault Weapons',
    'dangerous and unusual': 'Dangerous and Unusual Weapons',

    # More Title Case merges
    'Handgun Mail Ban': 'Right to Acquire',
    'Handgun Purchase': 'Right to Acquire',
    'Handgun Roster': 'Gun Control',
    'Handguns': 'Right to Acquire',
    'Arms': 'Second Amendment',
    'Arms Definition': 'Second Amendment',
    'Ancillary Rights': 'Right to Acquire',
    'Firearms Acquisition': 'Right to Acquire',
    'Ammunition': 'Right to Acquire',
    'Age Restrictions': 'Young Adults',
    '18 to 20 Year Olds': 'Young Adults',
    '18-to-20 Year Olds': 'Young Adults',
    'Under-21': 'Young Adults',

    # More DOJ/ATF/Gov merges
    'Attorney General Overreach': 'DOJ',
    'DOJ Second Amendment Task Force': 'DOJ',
    'Federal Law Enforcement': 'DOJ',
    'Federal Prosecution': 'DOJ',
    'FBI': 'DOJ',
    'Civil Rights': 'Fourteenth Amendment',
    'Disenfranchisement': 'Fourteenth Amendment',
    'Federal Employees': 'Executive Power',
    'Federal Employment': 'Executive Power',
    'Federal Grants': 'Executive Power',
    'Grant Termination': 'Executive Power',
    'Elon Musk': 'Executive Power',
    'Government Shutdown': 'Executive Power',
    'Climate Grants': 'Executive Power',
    'Inflation Reduction Act': 'Executive Power',
    'Department of Commerce': 'Executive Power',
    'Department of Education': 'Executive Power',
    'Federal Trade Commission': 'Constitutional Law',
    'Federal Benefits': 'Executive Power',
    'Federal Contracting': 'Executive Power',

    # More Constitutional Law
    'Supremacy Clause': 'Constitutional Law',
    'Article I': 'Constitutional Law',
    'Article II': 'Executive Power',
    'Article III': 'Constitutional Law',
    'Article One': 'Constitutional Law',
    'Commander in Chief': 'Executive Power',
    'For Cause Removal': 'Executive Power',
    "Humphrey's Executor": "Executive Power",
    'Independent Agencies': 'Constitutional Law',
    'Commerce Clause': 'Constitutional Law',
    'Appropriations Clause': 'Constitutional Law',
    'Enumerated Powers': 'Constitutional Law',
    'Code of Federal Regulations': 'Constitutional Law',
    'Chevron': 'Constitutional Law',
    'Loper Bright': 'Constitutional Law',
    'Nondelegation Doctrine': 'Constitutional Law',
    'Anti-Commandeering': 'Constitutional Law',
    'Intergovernmental Immunity': 'Constitutional Law',
    'Sovereign Immunity': 'Constitutional Law',

    # More SCOTUS
    'Unanimous Decision': 'SCOTUS',
    'Cert Denied': 'SCOTUS',
    'Cert Granted': 'SCOTUS',
    'Shadow Docket': 'SCOTUS',
    'Emergency Docket': 'SCOTUS',

    # Misc
    'Class Action': 'Standing',
    'Sua Sponte': 'Federal Courts',
    'Forum Shopping': 'Federal Courts',
    'Mandamus': 'Federal Courts',
    'Motion to Vacate': 'Federal Courts',
    'Motion to Dismiss': 'Federal Courts',
    'Rule of Law': 'Constitutional Law',
    'State Constitution': 'Constitutional Law',
    'State Constitutional Rights': 'Constitutional Law',
    'State Court': 'Federal Courts',
    'State Supreme Court': 'Federal Courts',
    'State Legislation': 'Gun Control',
    'State Action': 'Constitutional Law',
    'Federal Litigation': 'Federal Courts',
    'Federal Firearms Licensee': 'Gun Control',
    'Firearms Business': 'Gun Industry',
    'Gun Industry Liability': 'PLCAA',
    'Protection of Lawful Commerce in Arms Act': 'PLCAA',
    'Financial Services': 'Federal Reserve',
    'Banking Regulation': 'Federal Reserve',
    'BlackRock': 'Federal Reserve',
    'State Street': 'Federal Reserve',
    'Vanguard': 'Federal Reserve',
    'ESG': 'Federal Reserve',
    'Index Funds': 'Federal Reserve',
    'School Shootings': 'Self-Defense',
    'Pepper Spray': 'Self-Defense',
    'Stun Guns': 'Self-Defense',
    'Non-Lethal Arms': 'Self-Defense',
    'Armed Citizenry': 'Self-Defense',
    'Knife Rights': 'Self-Defense',
    'Competitive Shooting': 'Second Amendment',
    'Kim Rhode': 'Second Amendment',
    'Serial Numbers': 'Ghost Guns',
    'Glock Switch': 'Machine Guns',
    'In Memoriam': 'Second Amendment',
    'Autopen': 'Executive Power',
    '1791-founding-era': 'Bruen',
    '1791 Founding Era': 'Bruen',
    'Founding Era': 'Bruen',
    'Historical Research': 'Bruen',
    'Plain Text': 'Bruen',
    'Ordered Liberty': 'Bruen',
    'Natural Rights': 'Bruen',
    'Constitutional History': 'Bruen',
    'American Exceptionalism': 'Originalism',
    'Philosophy': 'Originalism',
    'Individual Rights': 'Constitutional Law',
    'Civic Rights': 'Fourteenth Amendment',
    'Civil Commitment': 'Mental Health',
    'Deinstitutionalization': 'Mental Health',
    'Drug User Gun Ban': 'Drug User Gun Ban',
    'Drug Cartels': 'Immigration',
    'Narco Terrorism': 'Immigration',
    'Maduro': 'Immigration',
    'Nicolas Maduro': 'Immigration',
    'Venezuela': 'Immigration',
    'Anchor Baby': 'Immigration',
    'In-State Tuition': 'Immigration',
    'Parole Program': 'Immigration',
    'Sanctuary Cities': 'Immigration',
    'Sanctuary Laws': 'Immigration',
    'Sanctuary Policies': 'Immigration',
    'CHNV Program': 'Immigration',
    'Temporary Protected Status': 'Immigration',
    'Election Law': 'Redistricting',
    'Election Integrity': 'Redistricting',
    'Voter Registration': 'Redistricting',
    'Louisiana v. Callais': 'Redistricting',
    'Voting Rights Act': 'Voting Rights Act',
    'Demographic Change': 'Redistricting',
    'Electoral Replacement': 'Redistricting',
    'Congressional Elections': 'Redistricting',
    'IEEPA': 'Executive Power',
    'National Security': 'Executive Power',
    'National Guard': 'Executive Power',
    'Lisa Cook': 'Federal Reserve',
    'Scott Bessant': 'Federal Reserve',
    'Civil Service': 'Executive Power',
    'Classified Information': 'Executive Power',
    'Whistleblower': 'Executive Power',
    'White House': 'Executive Power',
    'White House Access': 'Executive Power',
    'Press Secretary': 'Executive Power',
    'Karoline Leavitt': 'Executive Power',
    'Judicial Misconduct': 'Federal Courts',
    'Judicial Overreach': 'Federal Courts',
    'Judicial Activism': 'Federal Courts',
    'Judicial Appointments': 'Federal Courts',
    'Judicial Confirmations': 'Federal Courts',
    'Judicial Immunity': 'Federal Courts',
    'Delay Tactics': 'Federal Courts',
    'Interlocutory Appeal': 'Federal Courts',
    'Court of Federal Claims': 'Federal Courts',
    'Tucker Act': 'Federal Courts',
    'Court Packing': 'Federal Courts',
    'Cooper And Kirk': 'Cooper and Kirk',
    'Police Protection': 'Self-Defense',
    'Street Crime': 'Self-Defense',
    'Violent Crime': 'Self-Defense',
    'Left-Wing Extremism': 'Political Violence',
    'Lawfare': 'Federal Courts',
    'Law Enforcement': 'DOJ',
    'Legal Ethics': 'Federal Courts',
    'Legal Scholarship': 'Originalism',
    'Alternative Media': 'First Amendment',
    'CBS News': 'First Amendment',
    'Fox News': 'First Amendment',
    'Associated Press': 'First Amendment',
    'New York Times': 'First Amendment',
    'Media Bias': 'First Amendment',
    'Social Media': 'First Amendment',
    'International Law': 'Originalism',
    'South African Constitution': 'Originalism',
    'Anglosphere': 'Originalism',
    'Western Civilization': 'Originalism',
    'United Kingdom': 'Originalism',
    'Adjudicative Facts': 'Bruen',
    'Legislative Facts': 'Bruen',
    'Dangerousness Standard': 'Bruen',
    'Dangerous Persons': 'Felon in Possession',
    'ADA': 'Constitutional Law',
    'APA': 'Constitutional Law',
    'CFPB': 'Federal Reserve',
    'CPSC': 'Constitutional Law',
    'FTC': 'Constitutional Law',
    'EPA': 'Executive Power',
    'PBS': 'Executive Power',
    'Corporation for Public Broadcasting': 'Executive Power',
    'National Science Foundation': 'Executive Power',
    'NIH': 'Executive Power',
    'Bureau of Industry and Security': 'Executive Power',
    'Bureau of Labor Statistics': 'Executive Power',
    'RICO': 'DOJ',
    'LEOSA': 'Concealed Carry',
    'Obstruction of Justice': 'DOJ',
    'Prosecutorial Discretion': 'DOJ',
    'Prosecutorial Disqualification': 'DOJ',
    'Protect Our Prosecutors and Judges Act': 'DOJ',
    'Subpoena': 'DOJ',
    'Grand Jury': 'DOJ',
    'Mortgage Fraud': 'DOJ',
    'Republican Party': 'Trump Administration',
    'John Thune': 'Trump Administration',
    'Tom Cotton': 'Trump Administration',
    'Chuck Grassley': 'Trump Administration',
    'Senator Grassley': 'Trump Administration',
    'Senator Mike Lee': 'Trump Administration',
    'Jeanine Pirro': 'Trump Administration',
    '1994 Republican Revolution': 'Trump Administration',
    'One Big Beautiful Bill': 'Constitutional Law',
    'Unconstitutional': 'Constitutional Law',
    'PRWORA': 'Constitutional Law',
    'Welfare Reform': 'Constitutional Law',
    'Proposition 63': 'Gun Control',
    'Firearms Registration': 'Gun Control',
    'Gun Registry': 'Gun Control',
    'Firearms Owners Protection Act': 'Gun Control',
    'Gun Control Act': 'Gun Control',
    'Gun Control Act 1968': 'Gun Control',
    'Switchblade Act': 'Machine Guns',
    'Permanent Injunction': 'Injunctive Relief',
    'Nationwide Injunction': 'Injunctive Relief',
    'Injunction Vacated': 'Injunctive Relief',
    'May Issue': 'Concealed Carry',
    'Carry Ban': 'Concealed Carry',
    'Non-Resident Carry Rights': 'Concealed Carry',
    'USPS': 'Sensitive Places',
    'Post Office': 'Sensitive Places',
    'Post Offices': 'Sensitive Places',
    'Postal Handgun Ban': 'Sensitive Places',
    'Concert Venues': 'Sensitive Places',
    'Comprehensive Security': 'Sensitive Places',
    'Public Schools': 'Sensitive Places',
    'Federal Property': 'Sensitive Places',
    'Times Square': 'Sensitive Places',
    'Courthouses': 'Sensitive Places',
    'Sporting Events': 'Sensitive Places',
    'Racetracks': 'Sensitive Places',
    'Polling Places': 'Sensitive Places',
    'Congress': 'Constitutional Law',
    'House of Representatives': 'Constitutional Law',
    'Senate Filibuster': 'Constitutional Law',
    'Senate Procedure': 'Constitutional Law',
    'Senate Judiciary Committee': 'Constitutional Law',
    'Hakeem Jeffries': 'Constitutional Law',
    'George Santos': 'Constitutional Law',
    'Zohran Mamdani': 'Constitutional Law',
    'Century Arms': 'Gun Industry',
    'Byrna Technologies': 'Gun Industry',
    'Smith & Wesson': 'Gun Industry',
    'Artificial Intelligence': 'Technology Policy',
    'Technology Policy': 'Technology Policy',
    'Drones': 'Technology Policy',
    'Drone Deer Recovery': 'Technology Policy',
    'Right to Repair': 'Technology Policy',
    'Post 1986': 'Machine Guns',
    '1791-founding-era': 'Bruen',
    'Firearm Exports': 'Gun Industry',
    'Restoration of Rights': 'Felon in Possession',
    'Presidential Commission': 'Executive Power',
    'Presidential Pardon': 'Executive Power',
    'Presidential Pardons': 'Executive Power',
    'Presidential Authority': 'Executive Power',
    'Presidential Power': 'Executive Power',
    'Presidential Removal Power': 'Executive Power',
    'Remedy Phase': 'Injunctive Relief',
    'Non Lethal Weapons': 'Self-Defense',
    'Substantial Non Infringing Uses': 'Product Liability',
    'Cox Communications': 'Product Liability',
    'Contributory Liability': 'Product Liability',
    'Third Party Liability': 'Product Liability',
    'Antitrust': 'Product Liability',
    'Opportunity Cost': 'Second Amendment',
    'First They Came for the Gun Owners': 'Second Amendment',
    'Mexico': 'Product Liability',
    'Mexico Lawsuit': 'Product Liability',
    'Georgia': 'Georgia',
    'Georgia Supreme Court': 'Georgia',
    'Tennessee': 'Tennessee',
    'Minnesota': 'Minnesota',
    'Minneapolis': 'Minnesota',
    'Missouri': 'Missouri',
    'Michigan': 'Michigan',
    'Oregon': 'Oregon',
    'Massachusetts': 'Massachusetts',
    'Maryland': 'Maryland',
    'Maine': 'Maine',
    'Pennsylvania': 'Pennsylvania',
    'Rhode Island': 'Rhode Island',
    'Los Angeles County': 'California',
    'Rob Bonta': 'California',
    'Pritzker': 'Illinois',
    'Cook County': 'Illinois',
    'NYPD': 'New York',
    'Kathy Hochul': 'New York',
    'Letitia James': 'New York',
    'New York Ccia': 'New York',
    'Glenn Youngkin': 'Virginia',
    'Fairfax County': 'Virginia',
    'Old Dominion University': 'Virginia',
    'Olympus Spa': 'Virginia',
    'Sheriff Grady Judd': 'Florida',
    'McDaniels v. Florida': 'Florida',
    'Air Force Academy': 'Sensitive Places',
    'West Point': 'Sensitive Places',
    'Harvard Journal': 'Originalism',
    'Harvard Journal of Law and Public Policy': 'Originalism',
    'Turning Point USA': 'Second Amendment',
    'Charlie Kirk': 'Second Amendment',
    'Tariff Authority': 'Executive Power',
    'Taxing Power': 'Constitutional Law',
    'SAPA': 'Constitutional Law',
    'Snyder Act': 'Constitutional Law',
    'Native American Citizenship': 'Fourteenth Amendment',
    'Native Americans': 'Fourteenth Amendment',
    'Norman v. State': 'Open Carry',
    'Everytown': 'Gun Control',
    'Gun Rights Policy Conference': 'Second Amendment',
    'Lee Zeldin': 'Executive Power',
    'Gay Rights': 'Fourteenth Amendment',
    'Conversion Therapy': 'Fourteenth Amendment',
    'Talk Therapy': 'Fourteenth Amendment',
    'Professional Licensing': 'First Amendment',
    'Students for Fair Admissions': 'Fourteenth Amendment',
    'Brown University': 'Fourteenth Amendment',
    'University of Washington': 'Fourteenth Amendment',
    'Meritocracy': 'Fourteenth Amendment',
    'Labeling Game': 'Bruen',
    'Policy Analysis': 'Gun Control',
    'Harvey Wilkinson': 'Federal Courts',
    'Frank Easterbrook': 'Federal Courts',
    'Woodrow Wilson': 'Executive Power',
    'Reagan': 'Executive Power',
    'Rebecca Slaughter': 'Constitutional Law',
    'Political Trends': 'Redistricting',
    'Protests': 'First Amendment',
    'Peter Schweizer': 'Executive Power',
    'The Invisible Coup': 'Executive Power',
    'John Bolton': 'Executive Power',
    'Todd Blanch': 'DOJ',
    'Robert Summerhays': 'Federal Courts',
    'Don Willett': 'Federal Courts',
    'Alan Beck': 'Second Amendment',
    'Overton Window': 'Gun Control',
    'Muslim Brotherhood': 'Immigration',
    'Stephen Halbrook': 'Second Amendment',
    'Paul Clement': 'Second Amendment',
    'Neil Gorsuch': 'Justice Gorsuch',
    'Veterans Rights': 'Second Amendment',
    '2020 Election': 'Redistricting',
    '2026 Midterms': 'Redistricting',
    'Democratic Party': 'Redistricting',
    'Abigail Spanberger': 'Redistricting',
    'Taxpayer Fraud': 'DOJ',
    'interstate-travel': 'Concealed Carry',
    'Interstate Travel': 'Concealed Carry',
    'Virgin Islands': 'Concealed Carry',
    'Militia Clause': 'Second Amendment',
    'Militia Training': 'Second Amendment',
    'The People': 'Second Amendment',
    'Privateers': 'Second Amendment',
    'Letters of Marque': 'Second Amendment',
    'Unconstitutional': 'Constitutional Law',
    'Right to Acquire': 'Right to Acquire',
    'ANJRPC': 'New Jersey',
    'Berney v. Delaware': 'Delaware',
    'New Hampshire': 'New Hampshire',
    'New Mexico': 'New Mexico',
    'Vermont': 'Vermont',
    'Washington State': 'Washington State',
    'PRWORA': 'Constitutional Law',

    # --- Round 3: more aggressive merges for remaining low-count tags ---
    'As-Applied Challenge': 'Bruen',
    'Facial Challenge': 'Bruen',
    'Facial Challenges': 'Bruen',
    'Dangerous and Unusual Weapons': 'Assault Weapons',
    'Dangerous Persons': 'Felon in Possession',
    'Vampire Rule': 'Bruen',
    'Legal Analysis': 'Second Amendment',
    'Oral Argument': 'SCOTUS',
    'Product Liability': 'PLCAA',
    'Ammunition': 'Right to Acquire',
    'Firearms Acquisition': 'Right to Acquire',
    'Handguns': 'Right to Acquire',
    'Handgun Purchase': 'Right to Acquire',
    'Handgun Roster': 'Gun Control',
    'Handgun Mail Ban': 'Right to Acquire',
    'Anti Discrimination': 'Fourteenth Amendment',
    'Bars and Alcohol': 'Sensitive Places',
    'Collectivism': 'Originalism',
    'Conservative Movement': 'Second Amendment',
    'Constitutional Amendment': 'Constitutional Law',
    'Congressional Oversight': 'Constitutional Law',
    'Detention': 'Immigration',
    'Digital Rights': 'First Amendment',
    'Drug Conspiracy': 'DOJ',
    'Extraterritorial Jurisdiction': 'Constitutional Law',
    'Fifth Amendment': 'Fourteenth Amendment',
    'Fourth Amendment': 'Fourteenth Amendment',
    'Free Exercise': 'First Amendment',
    'Religious Liberty': 'First Amendment',
    'Government Security Principle': 'Sensitive Places',
    'Group Firearms Training': 'Second Amendment',
    'Gun Culture': 'Second Amendment',
    'Gun Industry Liability': 'PLCAA',
    'Interest Balancing': 'Bruen',
    'Individualized Assessment': 'Bruen',
    'Adjudicative Facts': 'Bruen',
    'Legislative Facts': 'Bruen',
    'Dangerousness Standard': 'Bruen',
    'Citizenship Clause': 'Fourteenth Amendment',
    'Dred Scott': 'Fourteenth Amendment',
    'Subject to the Jurisdiction': 'Fourteenth Amendment',
    'Education': 'Parental Rights',
    'In-State Tuition': 'Immigration',
    'Clemency': 'Executive Power',
    'Deregulation': 'Constitutional Law',
    'Blue Slip': 'Federal Courts',
    'Case Vehicle': 'Certiorari',
    'China': 'Executive Power',
    'Constitutional History': 'Bruen',
    'Founding Era': 'Bruen',
    'Plain Text': 'Bruen',
    'Text and History': 'Bruen',
    'Statute of Northampton': 'Bruen',
    'Historical Research': 'Bruen',
    'Ordered Liberty': 'Bruen',
    'Labeling Game': 'Bruen',
    'Race-Based Admissions': 'Fourteenth Amendment',
    'Gender Dysphoria': 'Fourteenth Amendment',
    'Gender Identity': 'Fourteenth Amendment',
    'Class Action': 'Standing',
    'Mootness': 'Standing',
    'Right to Repair': 'Constitutional Law',
    'Ultra Vires': 'Constitutional Law',
    'Mass Shootings': 'Gun Control',
    'Policy Analysis': 'Gun Control',
    'Overton Window': 'Gun Control',
    'Everytown': 'Gun Control',
    'Legislative Strategy': 'Gun Control',
    'Digital Rights': 'First Amendment',
    'Membership List': 'First Amendment',
    'Rifle Carry': 'Concealed Carry',
    'Shotgun Carry': 'Concealed Carry',
    'Travelers Exception': 'Concealed Carry',
    'Northern District Texas': 'Fifth Circuit',
    'Federal Litigation': 'Federal Courts',
    'Legal Ethics': 'Federal Courts',
    'Legal Scholarship': 'Originalism',
    'International Law': 'Originalism',
    'Pattern and Practice': 'DOJ',
    'Barnett': 'Barnett v. Raoul',
    'Cheeseman': 'Cheeseman v. Polillo',
    'Ree Case': 'Federal Courts',
    'Rush Case': 'Federal Courts',
    'McCoy Case': 'Federal Courts',
    'Harmani Case': 'United States v. Hammani',
    'Wolford': 'Wolford v. Lopez',
    'Wolford v. Bonta': 'Wolford v. Lopez',
    'Drug Cartels': 'Immigration',
    'Narco Terrorism': 'Immigration',
    'Parole Program': 'Immigration',
    'Muslim Brotherhood': 'Immigration',
    'Hunting': 'Second Amendment',
    'Hunting Regulations': 'Gun Control',
    'Competitive Shooting': 'Second Amendment',
    'Gun Rights Enforcement': 'Second Amendment',
    'In Memoriam': 'Second Amendment',
    'Military Academies': 'Sensitive Places',
    'Military Installations': 'Sensitive Places',
    'Mortgage Fraud': 'DOJ',
    'Prosecutorial Discretion': 'DOJ',
    'Police Protection': 'Self-Defense',
    'Street Crime': 'Self-Defense',
    'Violent Crime': 'Self-Defense',
    'Political Violence': 'DOJ',
    'Taxi': 'Constitutional Law',
    'Caetano': 'Second Amendment',
    'Bevis v. Naperville': 'Assault Weapons',
    'Duncan v. Bonta': 'Magazine Ban',
    'Baird v. Bonta': 'California',
    'Sanchez v. Bonta': 'California',
    'Rode v Bonta': 'California',
    'Proposition 63': 'California',
    'Mirabelli v. Olsen': 'Concealed Carry',
    'McIntyre v. Ohio': 'First Amendment',
    'Range v. Garland': 'Felon in Possession',
    'Norman v. State': 'Open Carry',
    'Shoenthal v. Ralph': 'Federal Courts',
    'Veterans Rights': 'Second Amendment',
    'Vincent v. Bondi': 'DOJ',
    'Cooper and Kirk': 'Second Amendment',
    'Cooper And Kirk': 'Second Amendment',
    'Department of Defense': 'Executive Power',
    'Taxpayer Fraud': 'DOJ',
    'Restoration of Rights': 'Felon in Possession',
    'Temple Gun Club': 'Sensitive Places',
    'Protests': 'First Amendment',
    'Delay Tactics': 'Federal Courts',
    'Senate Confirmation': 'Federal Courts',
    'Section 1983': 'Fourteenth Amendment',
    'Section 12601': 'DOJ',
    'Prosecutorial Disqualification': 'DOJ',
    'Obstruction of Justice': 'DOJ',
    'Subpoena': 'DOJ',
    'Grand Jury': 'DOJ',
    'Antigua': 'DOJ',
    'FBI': 'DOJ',
    'National Guard': 'Executive Power',
    'National Security': 'Executive Power',
    'Hakeem Jeffries': 'Constitutional Law',
    'George Santos': 'Constitutional Law',
    'Zohran Mamdani': 'Constitutional Law',
    'Charlie Kirk': 'Second Amendment',
    'Turning Point USA': 'Second Amendment',
    'Peter Schweizer': 'Executive Power',
    'John Bolton': 'Executive Power',
    'Rebecca Slaughter': 'Constitutional Law',
    'Kathy Hochul': 'New York',
    'Letitia James': 'New York',
    'Glenn Youngkin': 'Virginia',
    'Rob Bonta': 'California',
    'Pritzker': 'Illinois',
    'Sheriff Grady Judd': 'Florida',
    'NYPD': 'New York',
    'Los Angeles County': 'California',
    'Fairfax County': 'Virginia',
    'Old Dominion University': 'Virginia',
    'Cook County': 'Illinois',
    'West Point': 'Sensitive Places',
    'Air Force Academy': 'Sensitive Places',
    'Brown University': 'Fourteenth Amendment',
    'University of Washington': 'Fourteenth Amendment',
    'Harvey Wilkinson': 'Federal Courts',
    'Frank Easterbrook': 'Federal Courts',
    'Robert Summerhays': 'Federal Courts',
    'Don Willett': 'Federal Courts',
    'Left-Wing Extremism': 'DOJ',
    'Woodrow Wilson': 'Executive Power',
    'Reagan': 'Executive Power',
    'SAPA': 'Constitutional Law',
    'Snyder Act': 'Constitutional Law',
    'Welfare Reform': 'Constitutional Law',
    'One Big Beautiful Bill': 'Constitutional Law',
    'Fox News': 'First Amendment',
    'CBS News': 'First Amendment',
    'Associated Press': 'First Amendment',
    'New York Times': 'First Amendment',
    'Media Bias': 'First Amendment',
    'Social Media': 'First Amendment',
    'Alternative Media': 'First Amendment',
    'Harvard Journal': 'Originalism',
    'Harvard Journal of Law and Public Policy': 'Originalism',
    'South African Constitution': 'Originalism',
    'Anglosphere': 'Originalism',
    'Western Civilization': 'Originalism',
    'United Kingdom': 'Originalism',
    'American Exceptionalism': 'Originalism',
    'Philosophy': 'Originalism',
    'Alan Beck': 'Second Amendment',
    'Paul Clement': 'Second Amendment',
    'Stephen Halbrook': 'Second Amendment',
    'Byrna Technologies': 'Gun Industry',
    'Century Arms': 'Gun Industry',
    'Smith & Wesson': 'Gun Industry',
    'Firearm Exports': 'Gun Industry',
    'Federal Firearms Licensee': 'Gun Control',
    'Biden Era Regulations': 'Biden Administration',
    'Neil Gorsuch': 'Justice Gorsuch',
    'Lisa Cook': 'Federal Reserve',
    'Scott Bessant': 'Federal Reserve',
    'BlackRock': 'Federal Reserve',
    'State Street': 'Federal Reserve',
    'Vanguard': 'Federal Reserve',
    'Financial Services': 'Federal Reserve',
    'New York Ccia': 'New York',
    'Anchor Baby': 'Fourteenth Amendment',
    'Native American Citizenship': 'Fourteenth Amendment',
    'Native Americans': 'Fourteenth Amendment',
    'McDaniels v. Florida': 'Florida',
    'Georgia Supreme Court': 'Georgia',
    'Minneapolis': 'Minnesota',
    'Chicago': 'Illinois',
    'IEEPA': 'Executive Power',
    'Elon Musk': 'Executive Power',
    'Karoline Leavitt': 'Executive Power',
    'Press Secretary': 'Executive Power',
    'Deep State': 'Executive Power',
    'White House': 'Executive Power',
    'White House Access': 'Executive Power',
    'Civil Service': 'Executive Power',
    'Classified Information': 'Executive Power',
    'Whistleblower': 'Executive Power',
    'Government Shutdown': 'Executive Power',
    'Climate Grants': 'Executive Power',
    'Federal Benefits': 'Executive Power',
    'Federal Contracting': 'Executive Power',
    'Federal Grants': 'Executive Power',
    'Grant Termination': 'Executive Power',
    'Federal Employees': 'Executive Power',
    'Federal Employment': 'Executive Power',
    'Department of Commerce': 'Executive Power',
    'Department of Education': 'Executive Power',
    'Inflation Reduction Act': 'Executive Power',
    'Bureau of Industry and Security': 'Executive Power',
    'Bureau of Labor Statistics': 'Executive Power',
    'Corporation for Public Broadcasting': 'Executive Power',
    'National Science Foundation': 'Executive Power',
    'NIH': 'Executive Power',
    'EPA': 'Executive Power',
    'Lee Zeldin': 'Executive Power',
    'Tariff Authority': 'Executive Power',
    'Todd Blanch': 'DOJ',
    'Alvin Bragg': 'DOJ',
    'Fani Willis': 'DOJ',
    'Stun Guns': 'Self-Defense',
    'Pepper Spray': 'Self-Defense',
    'Non-Lethal Arms': 'Self-Defense',
    'Non Lethal Weapons': 'Self-Defense',
    'Knife Rights': 'Self-Defense',
    'School Shootings': 'Self-Defense',
    'School Safety': 'Self-Defense',
    'School Security': 'Self-Defense',
    'Kim Rhode': 'Second Amendment',
    'Privateers': 'Second Amendment',
    'Letters of Marque': 'Second Amendment',
    'Militia Clause': 'Second Amendment',
    'Militia Training': 'Second Amendment',
    'The People': 'Second Amendment',
    'Armed Citizenry': 'Self-Defense',
    'Cruz Case': 'Federal Courts',
    'RICO': 'DOJ',
    'The Invisible Coup': 'Executive Power',
    'Biden Administration': 'Biden Administration',
    'Regulatory Reform': 'Constitutional Law',
    'Federal Regulations': 'Constitutional Law',
    'Loper Bright': 'Constitutional Law',
    'Chevron': 'Constitutional Law',
    'ADA': 'Constitutional Law',
    'APA': 'Constitutional Law',
    'FTC': 'Constitutional Law',
    'CPSC': 'Constitutional Law',
    'Republican Party': 'Trump Administration',
    'John Thune': 'Trump Administration',
    'Tom Cotton': 'Trump Administration',
    'Chuck Grassley': 'Trump Administration',
    'Senator Grassley': 'Trump Administration',
    'Senator Mike Lee': 'Trump Administration',
    'Jeanine Pirro': 'Trump Administration',
    '1994 Republican Revolution': 'Trump Administration',
    'Hughes v. Lee': 'Machine Guns',
    'Glock Switch': 'Machine Guns',
    'Switchblade Act': 'Machine Guns',
    'Post 1986': 'Machine Guns',
    'Serial Numbers': 'Ghost Guns',
    'Remedy Phase': 'Injunctive Relief',
    'Permanent Injunction': 'Injunctive Relief',
    'Interlocutory Appeal': 'Federal Courts',
    'Students for Fair Admissions': 'Fourteenth Amendment',
    'Gay Rights': 'Fourteenth Amendment',
    'Conversion Therapy': 'Fourteenth Amendment',
    'Talk Therapy': 'Fourteenth Amendment',
    'Meritocracy': 'Fourteenth Amendment',
    'Professional Licensing': 'First Amendment',
    'Civil Commitment': 'Mental Health',
    'Deinstitutionalization': 'Mental Health',
    'Sovereign Immunity': 'Constitutional Law',
    'State Action': 'Constitutional Law',
    'State Constitution': 'Constitutional Law',
    'State Constitutional Rights': 'Constitutional Law',
    'Rule of Law': 'Constitutional Law',
    'Individual Rights': 'Constitutional Law',
    'Civic Rights': 'Fourteenth Amendment',
    'Civil Rights': 'Fourteenth Amendment',
    'Civil Rights Act of 1866': 'Fourteenth Amendment',
    'Disenfranchisement': 'Fourteenth Amendment',
    'Independent Agencies': 'Constitutional Law',
    'Code of Federal Regulations': 'Constitutional Law',
    'Nondelegation Doctrine': 'Constitutional Law',
    'Supremacy Clause': 'Constitutional Law',
    'Article I': 'Constitutional Law',
    'Article III': 'Constitutional Law',
    'Article One': 'Constitutional Law',
    'Anti-Commandeering': 'Constitutional Law',
    'Intergovernmental Immunity': 'Constitutional Law',
    'Commerce Clause': 'Constitutional Law',
    'Appropriations Clause': 'Constitutional Law',
    'Enumerated Powers': 'Constitutional Law',
    'Taxing Power': 'Constitutional Law',
    'Unanimous Decision': 'SCOTUS',
    'Congress': 'Constitutional Law',
    'House of Representatives': 'Constitutional Law',
    'Senate Filibuster': 'Constitutional Law',
    'Senate Procedure': 'Constitutional Law',
    'Senate Judiciary Committee': 'Federal Courts',
    'Court Packing': 'Federal Courts',
    'Court of Federal Claims': 'Federal Courts',
    'Tucker Act': 'Federal Courts',
    'Judicial Misconduct': 'Federal Courts',
    'Judicial Overreach': 'Federal Courts',
    'Judicial Activism': 'Federal Courts',
    'Judicial Appointments': 'Federal Courts',
    'Judicial Confirmations': 'Federal Courts',
    'Judicial Immunity': 'Federal Courts',
    'State Court': 'Federal Courts',
    'State Supreme Court': 'Federal Courts',
    'Federal Prosecution': 'DOJ',
    'Federal Law Enforcement': 'DOJ',
    'Law Enforcement': 'DOJ',
    'Protect Our Prosecutors and Judges Act': 'DOJ',
    'Unitary Executive': 'Executive Power',
    'Commander in Chief': 'Executive Power',
    'For Cause Removal': 'Executive Power',
    'Removal Power': 'Executive Power',
    "Humphrey's Executor": 'Executive Power',
    'Autopen': 'Executive Power',
    'Presidential Commission': 'Executive Power',
    'Presidential Pardon': 'Executive Power',
    'Presidential Pardons': 'Executive Power',
    'Presidential Authority': 'Executive Power',
    'Presidential Power': 'Executive Power',
    'Presidential Removal Power': 'Executive Power',
    'Article II': 'Executive Power',
    'OLC Memo': 'DOJ',
    'OLC Opinion': 'DOJ',
    'OLC opinion': 'DOJ',
    'Office of Legal Counsel': 'DOJ',
    'DOGE': 'Executive Power',
    'Office of Personnel Management': 'Executive Power',
    'State Legislation': 'Gun Control',
    'Firearms Registration': 'Gun Control',
    'Gun Registry': 'Gun Control',
    'Firearms Owners Protection Act': 'Gun Control',
    'Proposition 63': 'Gun Control',
    'Federal Gun Law': 'Gun Control',
    'Federal Gun Ban': 'Assault Weapons',
    'Firearms Prohibition': 'Assault Weapons',
    'Mexico': 'PLCAA',
    'Mexico Lawsuit': 'PLCAA',
    'Substantial Non Infringing Uses': 'PLCAA',
    'Cox Communications': 'PLCAA',
    'Contributory Liability': 'PLCAA',
    'Third Party Liability': 'PLCAA',
    'Antitrust': 'PLCAA',
    'Protection of Lawful Commerce in Arms Act': 'PLCAA',
    'NBA': 'Constitutional Law',
    'Opportunity Cost': 'Second Amendment',
    'First They Came for the Gun Owners': 'Second Amendment',
    'Vermont': 'Vermont',
    'Oregon': 'Oregon',
    'Massachusetts': 'Massachusetts',
    'Maryland': 'Maryland',
    'Maine': 'Maine',
    'Pennsylvania': 'Pennsylvania',
    'Delaware': 'Delaware',
    'Tennessee': 'Tennessee',
    'Michigan': 'Michigan',
    'Missouri': 'Missouri',
    'Colorado': 'Colorado',
    'Georgia': 'Georgia',
    'Connecticut': 'Connecticut',
    'Minnesota': 'Minnesota',
    'New Hampshire': 'New Hampshire',
    'New Mexico': 'New Mexico',
    'Rhode Island': 'Rhode Island',
    'Washington State': 'Washington State',
    'Ketanji Brown Jackson': 'Justice Jackson',
    'Justice Stevens': 'SCOTUS',
    'Chief Justice Roberts': 'SCOTUS',
    'Eighth Circuit': 'Eighth Circuit',
    'Brett Kavanaugh': 'SCOTUS',
    'Drones': 'Executive Power',
    'Drone Deer Recovery': 'Second Amendment',
    'Artificial Intelligence': 'Executive Power',
    'Technology Policy': 'Executive Power',
    'Right to Repair': 'Constitutional Law',
    'Lewis v. United States': 'Felon in Possession',
    'Spelling Correction': 'Federal Courts',
    'Abigail Spanberger': 'Virginia',
    'ESG': 'Federal Reserve',
    'Index Funds': 'Federal Reserve',
    'Banking Regulation': 'Federal Reserve',
    'Monetary Policy': 'Federal Reserve',
    'Operation Chokepoint': 'Federal Reserve',
    'Venezuela': 'Immigration',
    'Maduro': 'Immigration',
    'Nicolas Maduro': 'Immigration',
    'Sanctuary Cities': 'Immigration',
    'Sanctuary Laws': 'Immigration',
    'Sanctuary Policies': 'Immigration',
    'CHNV Program': 'Immigration',
    'Temporary Protected Status': 'Immigration',
    'Immigration Detention': 'Immigration',
    'Immigration Enforcement': 'Immigration',
    'Immigration Nationality Act': 'Immigration',
    'Illegal Aliens': 'Immigration',
    'ICE': 'Immigration',
    'ICE Enforcement': 'Immigration',
    'Louisiana v. Callais': 'Redistricting',
    'Election Law': 'Redistricting',
    'Election Integrity': 'Redistricting',
    'Voter Registration': 'Redistricting',
    'Demographic Change': 'Redistricting',
    'Electoral Replacement': 'Redistricting',
    'Political Trends': 'Redistricting',
    '2020 Election': 'Redistricting',
    '2026 Midterms': 'Redistricting',
    'Democratic Party': 'Redistricting',
}

# Build case-insensitive lookup
TAG_MERGE_LOWER = {k.lower(): v for k, v in TAG_MERGE.items()}

# Abbreviations that should stay uppercase in auto-converted tags
ABBREVIATIONS = {
    'DOJ', 'ATF', 'NRA', 'SCOTUS', 'ADA', 'ANJRPC', 'APA', 'FTC',
    'CFPB', 'DOGE', 'FBI', 'FFL', 'NFA', 'PBS', 'PLCAA', 'RICO',
    'SAF', 'ESG', 'ICE', 'LEOSA', 'NIH', 'USC', 'USPS', 'OLC',
    'CCW', 'EPA', 'NYPD', 'NBA', 'IEEPA', 'SAPA', 'PICA', 'DEI',
    'CPSC', 'PRWORA', 'CHNV', 'AR', 'DC', 'CBS', 'FPC',
}

# Words that stay lowercase in Title Case (except first word)
SMALL_WORDS = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in',
               'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'vs', 'v'}


def normalize_topic(topic):
    """Map a topic to its canonical form."""
    return TOPIC_MERGE.get(topic, topic)


def kebab_to_title(s):
    """Convert kebab-case to Title Case with abbreviation handling."""
    words = s.split('-')
    result = []
    for i, word in enumerate(words):
        if word.upper() in ABBREVIATIONS:
            result.append(word.upper())
        elif i > 0 and word in SMALL_WORDS:
            result.append(word)
        else:
            result.append(word.capitalize())
    return ' '.join(result)


def normalize_tag(tag):
    """Map a tag to its canonical form."""
    # Exact match
    if tag in TAG_MERGE:
        return TAG_MERGE[tag]

    # Case-insensitive match
    tag_lower = tag.lower()
    if tag_lower in TAG_MERGE_LOWER:
        return TAG_MERGE_LOWER[tag_lower]

    # Auto-convert kebab-case to Title Case
    if re.match(r'^[a-z0-9]+(-[a-z0-9]+)+$', tag):
        title = kebab_to_title(tag)
        if title in TAG_MERGE:
            return TAG_MERGE[title]
        if title.lower() in TAG_MERGE_LOWER:
            return TAG_MERGE_LOWER[title.lower()]
        return title

    # Auto-convert all-lowercase tags to Title Case
    if tag == tag.lower() and len(tag) > 1:
        # Handle abbreviations
        if tag.upper() in ABBREVIATIONS:
            title = tag.upper()
        else:
            words = tag.split()
            title = ' '.join(
                w.upper() if w.upper() in ABBREVIATIONS
                else (w if i > 0 and w in SMALL_WORDS else w.capitalize())
                for i, w in enumerate(words)
            )
        if title in TAG_MERGE:
            return TAG_MERGE[title]
        if title.lower() in TAG_MERGE_LOWER:
            return TAG_MERGE_LOWER[title.lower()]
        return title

    return tag


def replace_yaml_array(text, key, values):
    """Replace a YAML array field in frontmatter text, preserving other fields."""
    lines = text.split('\n')
    result = []
    i = 0
    found = False

    while i < len(lines):
        line = lines[i]
        if line.startswith(f'{key}:'):
            found = True
            # Skip the key line and all following array items
            i += 1
            while i < len(lines) and lines[i].startswith('  - '):
                i += 1
            # Write new array
            if values:
                result.append(f'{key}:')
                for v in values:
                    result.append(f'  - "{v}"')
            else:
                result.append(f'{key}: []')
        else:
            result.append(line)
            i += 1

    return '\n'.join(result)


def process_article(filepath):
    """Normalize topics and tags in a single article. Returns True if modified."""
    with open(filepath, 'r') as f:
        content = f.read()

    if not content.startswith('---'):
        return False

    # Split into frontmatter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        return False

    fm_text = parts[1]
    body = parts[2]

    # Parse to get current values
    fm = yaml.safe_load(fm_text)
    if fm is None:
        return False

    old_topics = fm.get('legal_topics') or []
    old_tags = fm.get('tags') or []

    # Normalize and deduplicate topics
    new_topics = []
    seen_topics = set()
    for t in old_topics:
        canonical = normalize_topic(t)
        if canonical not in seen_topics:
            seen_topics.add(canonical)
            new_topics.append(canonical)
    new_topics = new_topics[:MAX_TOPICS]

    # Normalize and deduplicate tags
    new_tags = []
    seen_tags = set()
    for t in old_tags:
        canonical = normalize_tag(t)
        if canonical not in seen_tags:
            seen_tags.add(canonical)
            new_tags.append(canonical)
    new_tags = new_tags[:MAX_TAGS]

    # Check if anything changed
    if new_topics == old_topics and new_tags == old_tags:
        return False

    # Replace arrays in frontmatter text
    new_fm = fm_text
    if old_topics or new_topics:
        new_fm = replace_yaml_array(new_fm, 'legal_topics', new_topics)
    if old_tags or new_tags:
        new_fm = replace_yaml_array(new_fm, 'tags', new_tags)

    new_content = '---' + new_fm + '---' + body

    with open(filepath, 'w') as f:
        f.write(new_content)
    return True


def main():
    articles = sorted(f for f in os.listdir(ARTICLES_DIR) if f.endswith('.md'))
    print(f'Processing {len(articles)} articles...\n')

    # Collect before stats
    before_topics = []
    before_tags = []
    for a in articles:
        path = os.path.join(ARTICLES_DIR, a)
        with open(path) as f:
            content = f.read()
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                fm = yaml.safe_load(parts[1])
                if fm:
                    before_topics.extend(fm.get('legal_topics') or [])
                    before_tags.extend(fm.get('tags') or [])

    print(f'BEFORE: {len(set(before_topics))} unique topics, {len(set(before_tags))} unique tags')

    # Process all articles
    changed = 0
    for a in articles:
        path = os.path.join(ARTICLES_DIR, a)
        if process_article(path):
            changed += 1

    # Collect after stats
    after_topics = []
    after_tags = []
    for a in articles:
        path = os.path.join(ARTICLES_DIR, a)
        with open(path) as f:
            content = f.read()
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                fm = yaml.safe_load(parts[1])
                if fm:
                    after_topics.extend(fm.get('legal_topics') or [])
                    after_tags.extend(fm.get('tags') or [])

    print(f'AFTER:  {len(set(after_topics))} unique topics, {len(set(after_tags))} unique tags')
    print(f'\nModified {changed}/{len(articles)} articles')

    # Show top topics and tags
    topic_counts = Counter(after_topics)
    tag_counts = Counter(after_tags)

    print(f'\n--- Top 20 Topics ---')
    for t, c in topic_counts.most_common(20):
        print(f'  {c:3d}  {t}')

    print(f'\n--- Top 20 Tags ---')
    for t, c in tag_counts.most_common(20):
        print(f'  {c:3d}  {t}')

    # Show remaining long-tail topics/tags
    print(f'\n--- All {len(set(after_topics))} unique topics ---')
    for t in sorted(set(after_topics)):
        print(f'  {topic_counts[t]:3d}  {t}')

    print(f'\n--- All {len(set(after_tags))} unique tags ---')
    for t in sorted(set(after_tags)):
        print(f'  {tag_counts[t]:3d}  {t}')


if __name__ == '__main__':
    main()
