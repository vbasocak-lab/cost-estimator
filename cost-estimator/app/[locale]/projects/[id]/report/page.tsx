"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ReportPage() {
  const params = useParams();
  const locale = params.locale as string;
  const projectId = params.id as string;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Informations importantes concernant votre estimation de coûts
        </h1>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Important : Estimation provisoire</h2>
        <p className="text-gray-700 leading-7 mb-6">
          Il s&apos;agit d&apos;une estimation budgétaire provisoire. Les coûts réels dépendent, entre autres,
          des études techniques, des conditions du terrain, des réglementations locales (PLU) et des offres
          des entreprises exécutantes. Cette estimation est non contractuelle et ne constitue pas une offre
          commerciale. Les coûts réels du projet peuvent varier en fonction de la planification détaillée,
          des exigences techniques, des choix architecturaux et des normes locales en vigueur.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Souhaitez-vous développer votre projet ?</h2>
        <p className="text-gray-700 leading-7 mb-4">
          ÉLAN Architecture vous accompagne dans le développement global de votre projet – des premières idées
          à la réalisation. Notre approche ne se limite pas aux coûts. Nous intégrons la qualité architecturale,
          la durabilité, l&apos;efficacité énergétique et le contrôle budgétaire dès les premières phases de conception.
        </p>

        <p className="text-gray-800 font-medium mb-3">Nous vous proposons :</p>
        <ul className="list-disc pl-6 text-gray-700 leading-7 mb-6 space-y-1">
          <li>Une analyse de faisabilité approfondie</li>
          <li>Un accompagnement pour la définition du programme et des besoins</li>
          <li>Une conception architecturale optimisée</li>
          <li>Une stratégie de maîtrise des coûts dès la phase d&apos;esquisse</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Offre de bienvenue :</h2>
        <p className="text-gray-700 leading-7 mb-6">
          Pour toute demande via cette plateforme, nous offrons une remise de 20 % sur votre première étude
          de faisabilité ou votre première consultation architecturale.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">FAQ – Questions fréquemment posées</h2>

        <div className="space-y-4 text-gray-700 leading-7 mb-6">
          <div>
            <p className="font-semibold text-gray-900">Cette estimation est-elle fiable ?</p>
            <p>
              Il s&apos;agit d&apos;une estimation basée sur des données réelles du marché. Elle sert d&apos;orientation
              initiale, mais ne remplace en aucun cas une étude de projet détaillée.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Les honoraires d&apos;architecte sont-ils inclus ?</p>
            <p>
              Non. Cette estimation concerne principalement les coûts de construction prévisionnels.
              Les honoraires dépendent de l&apos;ampleur du projet et du niveau d&apos;accompagnement souhaité.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Le résultat est-il valable pour toute la France ?</p>
            <p>
              Oui, sous réserve d&apos;ajustements régionaux. Dans certaines zones, notamment en Île-de-France,
              les coûts sont généralement plus élevés.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Peut-on construire directement avec ce budget ?</p>
            <p>
              Cette estimation est un point de départ. Pour valider la faisabilité et établir un budget définitif,
              une étude architecturale approfondie est indispensable.
            </p>
          </div>
        </div>

        <p className="text-gray-900 font-medium leading-7 mb-8">
          Chaque projet est unique. Une estimation est un point de départ – un projet de qualité commence
          par une planification rigoureuse.
        </p>

        <Link
          href={`/${locale}/projects/${projectId}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          Retour au projet
        </Link>
      </div>
    </div>
  );
}
